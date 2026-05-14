using AutoMapper;
using DAL.Interfaces;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class InstallmentService
    {
        private readonly IInstallmentRepository _installmentRepository;
        private readonly IMapper _mapper;

        public InstallmentService(IInstallmentRepository installmentRepository, IMapper mapper)
        {
            _installmentRepository = installmentRepository;
            _mapper = mapper;
        }

        // --- Get Active Gameyas (Paged) ---
        public async Task<PagedResults<GameyaDto>> GetActiveByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            var pagedResult = await _installmentRepository.GetActiveByUserAsync(userId, body);

            return new PagedResults<GameyaDto>
            {
                Items = _mapper.Map<List<GameyaDto>>(pagedResult.Items),
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

            return _mapper.Map<GameyaDetailDto>(entity);
        }

        // --- Create Gameya ---
        public async Task<GameyaDto?> CreateAsync(GameyaDto dto, string userId)
        {
            var entity = _mapper.Map<Gameya>(dto);

            entity.UserId = userId;
            entity.IsActive = true;

            var created = await _repository.AddAsync(entity);
            return _mapper.Map<GameyaDto>(created);
        }

        // --- Update Gameya ---
        public async Task<bool> UpdateAsync(GameyaDto dto, string userId)
        {
            var existing = await _repository.GetByIdAsync(dto.GameyaId);
            if (existing == null)
                throw new ArgumentException("Gameya not found.");

            if (existing.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this Gameya.");

            existing.Name = dto.Name;
            existing.MonthlyContribution = dto.MonthlyContribution;
            existing.TotalMembers = dto.TotalMembers;
            existing.MyTurn = dto.MyTurn;
            existing.StartDate = dto.StartDate;

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

    }
}
