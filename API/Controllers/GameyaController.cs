using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTO;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GameyaController : BaseController
    {
        private readonly IGameyaService _gameyaService;

        public GameyaController(IGameyaService gameyaService)
        {
            _gameyaService = gameyaService;
        }

        [HttpPost("List")]
        public async Task<ActionResult> GetActiveList([FromBody] RequestDto<WithOutFilter> body)
        {
            var result = await _gameyaService.GetActiveByUserAsync(CurrentUserId, body);
            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Gameyas listed successfully",
                Data = result
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetWithPayments(int id)
        {
            var result = await _gameyaService.GetWithPaymentsAsync(id, CurrentUserId);
            if (result == null)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Gameya not found" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Gameya loaded successfully",
                Data = result
            });
        }

        [HttpPost("Add")]
        public async Task<ActionResult> Create([FromBody] GameyaDto dto)
        {
            var created = await _gameyaService.CreateAsync(dto, CurrentUserId);
            if (created == null)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not create Gameya" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Gameya created successfully",
                Data = created
            });
        }

        [HttpPost("Update")]
        public async Task<ActionResult> Update([FromBody] GameyaDto dto)
        {
            var updated = await _gameyaService.UpdateAsync(dto, CurrentUserId);
            if (!updated)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not update Gameya" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Gameya updated successfully"
            });
        }

        [HttpPost("Deactivate/{id}")]
        public async Task<ActionResult> Deactivate(int id)
        {
            var deactivated = await _gameyaService.DeactivateAsync(id, CurrentUserId);
            if (!deactivated)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not deactivate Gameya" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Gameya deactivated successfully"
            });
        }

        [HttpDelete("Delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _gameyaService.DeleteAsync(id, CurrentUserId);
            if (!deleted)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not delete Gameya" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Gameya deleted successfully"
            });
        }

        [HttpPost("RecordPayment")]
        public async Task<ActionResult> RecordPayment([FromBody] GameyaPaymentDto dto)
        {
            var payment = await _gameyaService.RecordPaymentAsync(dto, CurrentUserId);
            if (payment == null)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not record payment" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Payment recorded successfully",
                Data = payment
            });
        }
    }
}
