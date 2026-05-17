using AutoMapper;
using DAL.Interfaces;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace BLL.Services
{
    public class WeeklyBudgetService
    {
        private readonly IWeeklyBudgetRepository _repository;
        private readonly IMapper _mapper;

        public WeeklyBudgetService(IWeeklyBudgetRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // ─── Get all weeks for a snapshot ───────────────────────────────
        public async Task<List<WeeklyBudgetDto>> GetBySnapshotAsync(int snapshotId, string userId)
        {
            var weeks = await _repository.GetBySnapshotAsync(snapshotId, userId);
            return weeks.Select(MapWithSpent).ToList();
        }

        // ─── Get the current week ────────────────────────────────────────
        public async Task<WeeklyBudgetDto?> GetCurrentWeekAsync(string userId)
        {
            var week = await _repository.GetCurrentWeekAsync(userId);
            return week is null ? null : MapWithSpent(week);
        }

        // ─── Create (manual, rare) ───────────────────────────────────────
        public async Task<WeeklyBudgetDto?> CreateAsync(WeeklyBudgetDto dto)
        {
            var entity = _mapper.Map<WeeklyBudget>(dto);
            var created = await _repository.AddAsync(entity);
            return _mapper.Map<WeeklyBudgetDto>(created);
        }

        // ─── Update budget amount ────────────────────────────────────────
        public async Task<bool> UpdateAsync(WeeklyBudgetDto dto, string userId)
        {
            // Ownership is enforced via the Snapshot navigation
            var weeks = await _repository.GetBySnapshotAsync(dto.SnapshotId, userId);
            var existing = weeks.FirstOrDefault(w => w.WeekBudgetId == dto.WeekBudgetId)
                ?? throw new ArgumentException("WeeklyBudget not found or you do not own it.");

            existing.BudgetAmount = dto.BudgetAmount;
            return await _repository.UpdateAsync(existing);
        }

        // ─── Delete ──────────────────────────────────────────────────────
        public async Task<bool> DeleteAsync(int weekBudgetId, string userId)
        {
            var entity = await _repository.GetByIdAsync(weekBudgetId)
                ?? throw new ArgumentException("WeeklyBudget not found.");

            // Validate user owns the parent snapshot
            var ownerWeeks = await _repository.GetBySnapshotAsync(entity.SnapshotId, userId);
            if (!ownerWeeks.Any(w => w.WeekBudgetId == weekBudgetId))
                throw new UnauthorizedAccessException("You do not own this WeeklyBudget.");

            return await _repository.DeleteAsync(weekBudgetId);
        }

        // ─── Private helper ──────────────────────────────────────────────
        private WeeklyBudgetDto MapWithSpent(WeeklyBudget w)
        {
            var dto = _mapper.Map<WeeklyBudgetDto>(w);
            dto.SpentAmount = w.Expenses?.Sum(e => e.Amount) ?? 0m;
            return dto;
        }
    }
}
