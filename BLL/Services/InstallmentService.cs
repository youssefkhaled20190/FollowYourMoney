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

       //get the active Installment by userid
        public async Task<PagedResults<InstallmentDto>> GetActiveByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            var pagedResult = await _installmentRepository.GetActiveByUserAsync(userId, body);

            return new PagedResults<InstallmentDto>
            {
                Items = _mapper.Map<List<InstallmentDto>>(pagedResult.Items),
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            };
        }

        //get all Installments by userid
        public async Task<InstallmentDto?> GetAllInstallmentsAsync(string userId , RequestDto<WithOutFilter>body)
        {
            var entity = await _installmentRepository.GetAllInstallmentsByUserAsync(userId , body);
            if (entity == null) return null;

            return _mapper.Map<InstallmentDto>(entity);
        }

        // --- Create installment ---
        public async Task<InstallmentDto?> CreateAsync(InstallmentDto dto, string userId)
        {
            var entity = _mapper.Map<Installment>(dto);

            entity.UserId = userId;
            entity.IsActive = true;

            var created = await _installmentRepository.AddAsync(entity);
            return _mapper.Map<InstallmentDto>(created);
        }

        // --- Update Installment ---
        public async Task<bool> UpdateAsync(InstallmentDto dto, string userId)
        {
            var existing = await _installmentRepository.GetByIdAsync(dto.InstallmentId);
            if (existing == null)
                throw new ArgumentException("Installment not found.");

            if (existing.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this Gameya.");

            existing.Name = dto.Name;
            existing.StartDate = dto.StartDate;
            existing.TotalMonths = dto.TotalMonths;
            existing.PaidMonths = dto.PaidMonths;
            

            return await _installmentRepository.UpdateAsync(existing);
        }

        // --- Deactivate Installment ---
        public async Task<bool> DeactivateAsync(int InstallmentId, string userId)
        {
            var entity = await _installmentRepository.GetByIdAsync(InstallmentId);
            if (entity == null)
                throw new ArgumentException("Installment not found.");

            if (entity.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this Installment.");

            entity.IsActive = false;
            return await _installmentRepository.UpdateAsync(entity);
        }

        // --- Delete Installment ---
        public async Task<bool> DeleteAsync(int InstallmentId, string userId)
        {
            var entity = await _installmentRepository.GetByIdAsync(InstallmentId);
            if (entity == null)
                throw new ArgumentException("Installment not found.");

            if (entity.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this Installment.");

            return await _installmentRepository.DeleteAsync(InstallmentId);
        }

    }
}
