using BLL.Services;
using DAL.Filter;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTO;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MonthlySnapshotController : BaseController
    {
        private readonly MonthlySnapshotService _service;

        public MonthlySnapshotController(MonthlySnapshotService service)
        {
            _service = service;
        }

        /// <summary>
        /// Returns a snapshot with weekly budgets and wishlist ETA summary.
        /// If year/month filter is provided, returns that specific month's snapshot.
        /// If no filter, returns the latest (most recent) snapshot.
        /// </summary>
        [HttpGet("Latest")]
        public async Task<ActionResult> GetLatest([FromQuery] RequestDto<MonthlySnapshotFilter> body)
        {
            var result = await _service.GetLatestAsync(CurrentUserId, body);
            if (result is null)
                return StatusCode(200, new GeneralResponseDto
                {
                    Result = false,
                    Message = "No monthly plan found. Please create one."
                });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Latest snapshot loaded successfully",
                Data = result
            });
        }

        /// <summary>Returns paged history of all monthly snapshots.</summary>
        [HttpGet("History")]
        public async Task<ActionResult> GetHistory([FromQuery] RequestDto<MonthlySnapshotFilter> body)
        {
            var result = await _service.GetHistoryAsync(CurrentUserId, body);
            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Snapshot history listed successfully",
                Data = result
            });
        }

        /// <summary>
        /// Creates a new monthly plan.
        /// Automatically fetches active gameyas + installments to compute commitments.
        /// Seeds 4 weekly budget rows.
        /// </summary>
        [HttpPost("Create")]
        public async Task<ActionResult> Create([FromBody] CreateSnapshotDto dto)
        {
            var created = await _service.CreateAsync(dto, CurrentUserId);
            if (created is null)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not create snapshot" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Monthly plan created successfully",
                Data = created
            });
        }

        /// <summary>
        /// Mid-month replan — user declares current cash in hand.
        /// Remaining weekly budgets are recalculated and a trigger is recorded.
        /// </summary>
        [HttpPost("RePlan")]
        public async Task<ActionResult> RePlan([FromBody] RePlanDto dto)
        {
            var result = await _service.RePlanAsync(CurrentUserId, dto);
            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Plan recalculated successfully",
                Data = result
            });
        }

        /// <summary>
        /// Edits/updates the monthly blueprint.
        /// </summary>
        [HttpPut("Update")]
        public async Task<ActionResult> Update([FromBody] EditSnapshotDto dto)
        {
            var updated = await _service.UpdateAsync(dto, CurrentUserId);
            if (updated is null)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not update plan" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Monthly plan updated successfully",
                Data = updated
            });
        }
    }
}
