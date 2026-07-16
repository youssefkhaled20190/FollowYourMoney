using AutoMapper;
using DAL.Enums;
using DAL.Interfaces;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace BLL.Services
{

    public class GameyaService 
    {
        private readonly IGameyaRepository _repository;
        private readonly IMapper _mapper;

        public GameyaService(IGameyaRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // --- Get Active Gameyas (Paged) ---
        public async Task<PagedResults<GameyaDetailDto>> GetActiveByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            var pagedResult = await _repository.GetActiveByUserAsync(userId, body);

            return new PagedResults<GameyaDetailDto>
            {
                Items = _mapper.Map<List<GameyaDetailDto>>(pagedResult.Items),
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            };
        }

        // --- Get All Gameyas (Paged) ---
        public async Task<PagedResults<GameyaDetailDto>> GetAllByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            var pagedResult = await _repository.GetAllByUserAsync(userId, body);

            return new PagedResults<GameyaDetailDto>
            {
                Items = _mapper.Map<List<GameyaDetailDto>>(pagedResult.Items),
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            };
        }

        // --- Get Gameya With Payment History ---
        public async Task<GameyaDetailDto?> GetWithPaymentsAsync(int gameyaId, string userId)
        {
            var entity = await _repository.GetWithPaymentsAsync(gameyaId, userId);
            if (entity == null) return null;

            // If the Gameya has fewer payments than TotalMembers (e.g. created before
            // auto-generation was added), regenerate the full schedule and persist it.
            if (entity.Payments.Count < entity.TotalMembers)
            {
                entity.Payments.Clear();
                var fullSchedule = GeneratePaymentSchedule(entity.StartDate, entity.TotalMembers, entity.MyTurn);
                foreach (var p in fullSchedule)
                    entity.Payments.Add(p);

                await _repository.UpdateAsync(entity);
            }

            return _mapper.Map<GameyaDetailDto>(entity);
        }

        // --- Create Gameya (auto-generates EndDate + payment schedule) ---
        public async Task<GameyaDetailDto?> CreateAsync(GameyaDto dto, string userId)
        {
            // Validate MyTurn
            if (dto.MyTurn < 1 || dto.MyTurn > dto.TotalMembers)
                throw new ArgumentException($"MyTurn must be between 1 and {dto.TotalMembers}.");

            var entity = _mapper.Map<Gameya>(dto);

            entity.UserId = userId;

            
            

            // Auto-calculate EndDate: last payment is at StartDate + (TotalMembers - 1) months
            entity.EndDate = entity.StartDate.AddMonths(entity.TotalMembers - 1);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (entity.EndDate < today)
            {
                entity.IsActive = false; // Mark as inactive if the end date is in the past
            }
            else 
            { 
                entity.IsActive = true; // Mark as active if the end date is in the future
            }

                // Auto-generate payment schedule
                entity.Payments = GeneratePaymentSchedule(entity.StartDate, entity.TotalMembers, entity.MyTurn);

            var created = await _repository.AddAsync(entity);
            return _mapper.Map<GameyaDetailDto>(created);
        }

        // --- Update Gameya ---
        public async Task<bool> UpdateAsync(GameyaDto dto, string userId)
        {
            var existing = await _repository.GetWithPaymentsAsync(dto.GameyaId, userId);
            if (existing == null)
                throw new ArgumentException("Gameya not found.");

            if (existing.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this Gameya.");

            // Validate MyTurn
            if (dto.MyTurn < 1 || dto.MyTurn > dto.TotalMembers)
                throw new ArgumentException($"MyTurn must be between 1 and {dto.TotalMembers}.");

            // Check if schedule-affecting fields changed
            bool scheduleChanged = existing.TotalMembers != dto.TotalMembers
                                || existing.MyTurn != dto.MyTurn
                                || existing.StartDate != dto.StartDate;

            existing.Name = dto.Name;
            existing.MonthlyContribution = dto.MonthlyContribution;
            existing.TotalMembers = dto.TotalMembers;
            existing.MyTurn = dto.MyTurn;
            existing.StartDate = dto.StartDate;
            existing.CreatedBy = dto.CreatedBy;

            // Recalculate EndDate
            existing.EndDate = existing.StartDate.AddMonths(existing.TotalMembers - 1);

            
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (existing.EndDate < today)
            {
                existing.IsActive = false; // Mark as inactive if the end date is in the past
            }
            else 
            { 
                existing.IsActive = true; // Mark as active if the end date is in the future
            }

            // Regenerate payments if schedule-affecting fields changed
            if (scheduleChanged)
            {
                existing.Payments.Clear();
                var newPayments = GeneratePaymentSchedule(existing.StartDate, existing.TotalMembers, existing.MyTurn);
                foreach (var p in newPayments)
                    existing.Payments.Add(p);
            }

            return await _repository.UpdateAsync(existing);
        }

        // --- Deactivate Gameya ---
        public async Task<bool> DeactivateAsync(int gameyaId, string userId)
        {
            var entity = await _repository.GetByIdAsync(gameyaId);
            if (entity == null)
                throw new ArgumentException("Gameya not found.");

            if (entity.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this Gameya.");

            entity.IsActive = false;
            return await _repository.UpdateAsync(entity);
        }

        // --- Delete Gameya ---
        public async Task<bool> DeleteAsync(int gameyaId, string userId)
        {
            var entity = await _repository.GetByIdAsync(gameyaId);
            if (entity == null)
                throw new ArgumentException("Gameya not found.");

            if (entity.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this Gameya.");

            return await _repository.DeleteAsync(gameyaId);
        }

        // --- Auto-deactivate expired Gameyas ---
        /// <summary>
        /// Finds all active gameyas for the user where EndDate has passed,
        /// and marks them as inactive so they no longer count in monthly commitments.
        /// </summary>
        public async Task CheckAndDeactivateExpiredAsync(string userId)
        {
            var allActive = await _repository.GetActiveByUserAsync(userId,
                new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            foreach (var gameya in allActive.Items)
            {
                if (gameya.EndDate < today)
                {
                    gameya.IsActive = false;
                    await _repository.UpdateAsync(gameya);
                }
            }
        }

        // --- Generate Payment Schedule ---
        /// <summary>
        /// Creates payment rows for every month of the Gameya lifecycle.
        /// Month 1 = StartDate itself, Month 2 = StartDate + 1 month, etc.
        /// The user's turn month gets Type = Received, all others get Type = Paid.
        /// </summary>
        private static List<GameyaPayment> GeneratePaymentSchedule(DateOnly startDate, int totalMembers, int myTurn)
        {
            var payments = new List<GameyaPayment>();

            for (int month = 1; month <= totalMembers; month++)
            {
                payments.Add(new GameyaPayment
                {
                    MonthNumber = month,
                    PaidOn = startDate.AddMonths(month - 1), // month 1 = StartDate itself
                    Type = month == myTurn ? PaymentType.Received : PaymentType.Paid
                });
            }

            return payments;
        }
    }
}
