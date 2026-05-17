using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.DTO;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InstallmentController : BaseController
    {
        private readonly InstallmentService _installmentService;

        public InstallmentController(InstallmentService installmentService)
        {
            _installmentService = installmentService;
        }

        [HttpGet("List")]
        public async Task<ActionResult> GetActiveList([FromQuery] RequestDto<WithOutFilter> body)
        {
            var result = await _installmentService.GetActiveByUserAsync(CurrentUserId, body);
            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "installments listed successfully",
                Data = result
            });
        }

        [HttpPost("Add")]
        public async Task<ActionResult> Create([FromBody] InstallmentDto dto)
        {
            var created = await _installmentService.CreateAsync(dto, CurrentUserId);
            if (created == null)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not create installment" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Gameya created successfully",
                Data = created
            });
        }

        [HttpPost("Deactivate/{id}")]
        public async Task<ActionResult> Deactivate(int id)
        {
            var deactivated = await _installmentService.DeactivateAsync(id, CurrentUserId);
            if (!deactivated)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not deactivate Installment" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Installment deactivated successfully"
            });
        }

        [HttpPut("Update")]
        public async Task<ActionResult> Update([FromBody] InstallmentDto dto)
        {
            var updated = await _installmentService.UpdateAsync(dto, CurrentUserId);
            if (!updated)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not update Installment" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Installment updated successfully"
            });
        }

        [HttpDelete("Delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _installmentService.DeleteAsync(id, CurrentUserId);
            if (!deleted)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not delete Installment" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Installment deleted successfully"
            });
        }
    }
}
