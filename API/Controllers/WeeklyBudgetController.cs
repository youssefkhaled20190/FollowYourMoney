using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTO;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WeeklyBudgetController : BaseController
    {
        private readonly WeeklyBudgetService _service;

        public WeeklyBudgetController(WeeklyBudgetService service)
        {
            _service = service;
        }

        /// <summary>Returns all 4 weekly budgets for a specific snapshot, with spent amounts.</summary>
        [HttpGet("List/{snapshotId}")]
        public async Task<ActionResult> GetBySnapshot(int snapshotId)
        {
            var result = await _service.GetBySnapshotAsync(snapshotId, CurrentUserId);
            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Weekly budgets listed successfully",
                Data = result
            });
        }

        /// <summary>
        /// Returns the budget for the current week (WeekStart ≤ today ≤ WeekEnd).
        /// Includes SpentAmount, RemainingBudget, and DaysRemaining.
        /// </summary>
        [HttpGet("CurrentWeek")]
        public async Task<ActionResult> GetCurrentWeek()
        {
            var result = await _service.GetCurrentWeekAsync(CurrentUserId);
            if (result is null)
                return StatusCode(200, new GeneralResponseDto
                {
                    Result = false,
                    Message = "No active weekly budget found for today"
                });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Current week budget loaded successfully",
                Data = result
            });
        }

        /// <summary>Manually adjusts the budget amount for a specific week.</summary>
        [HttpPut("Update")]
        public async Task<ActionResult> Update([FromBody] WeeklyBudgetDto dto)
        {
            var updated = await _service.UpdateAsync(dto, CurrentUserId);
            if (!updated)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not update weekly budget" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Weekly budget updated successfully"
            });
        }

        /// <summary>Deletes a weekly budget row.</summary>
        [HttpDelete("Delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id, CurrentUserId);
            if (!deleted)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not delete weekly budget" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Weekly budget deleted successfully"
            });
        }
    }
}
