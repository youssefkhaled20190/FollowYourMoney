using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTO;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WishlistController : BaseController
    {
        private readonly WishlistItemService _service;

        public WishlistController(WishlistItemService service)
        {
            _service = service;
        }

        /// <summary>
        /// Returns pending (not achieved) wishlist items ordered by priority,
        /// with ETA (months + human label) computed for each item.
        /// </summary>
        [HttpGet("List")]
        public async Task<ActionResult> GetPending([FromQuery] RequestDto<WithOutFilter> body)
        {
            var result = await _service.GetPendingByUserAsync(CurrentUserId, body);
            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Wishlist items listed successfully",
                Data = result
            });
        }

        /// <summary>Returns already-achieved wishlist items.</summary>
        [HttpGet("Achieved")]
        public async Task<ActionResult> GetAchieved([FromQuery] RequestDto<WithOutFilter> body)
        {
            var result = await _service.GetAchievedByUserAsync(CurrentUserId, body);
            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Achieved wishlist items listed successfully",
                Data = result
            });
        }

        /// <summary>Adds a new savings goal to the wishlist.</summary>
        [HttpPost("Add")]
        public async Task<ActionResult> Create([FromBody] WishlistItemDto dto)
        {
            var created = await _service.CreateAsync(dto, CurrentUserId);
            if (created is null)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not create wishlist item" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Wishlist item created successfully",
                Data = created
            });
        }

        /// <summary>
        /// Updates a wishlist item's name, target, saved amount, or priority.
        /// Automatically marks as achieved when SavedAmount >= TargetAmount.
        /// </summary>
        [HttpPut("Update")]
        public async Task<ActionResult> Update([FromBody] WishlistItemDto dto)
        {
            var updated = await _service.UpdateAsync(dto, CurrentUserId);
            if (!updated)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not update wishlist item" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Wishlist item updated successfully"
            });
        }

        /// <summary>Explicitly marks a wishlist item as achieved.</summary>
        [HttpPost("Achieve/{id}")]
        public async Task<ActionResult> Achieve(int id)
        {
            var result = await _service.MarkAchievedAsync(id, CurrentUserId);
            if (!result)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not mark item as achieved" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Wishlist item marked as achieved"
            });
        }

        /// <summary>Deletes a wishlist item.</summary>
        [HttpDelete("Delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id, CurrentUserId);
            if (!deleted)
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not delete wishlist item" });

            return StatusCode(200, new GeneralResponseDto
            {
                Result = true,
                Message = "Wishlist item deleted successfully"
            });
        }
    }
}
