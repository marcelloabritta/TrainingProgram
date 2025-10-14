using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrainingProgram.Api.Data;
using TrainingProgram.Api.Dtos;
using TrainingProgram.Api.Models;

namespace TrainingProgram.Api.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ActivitiesController(AppDbContext context)
        {
            _context = context;
        }

        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        }

        [HttpGet("trainingsessions/{sessionId}/activities")]
        public async Task<ActionResult<IEnumerable<Activity>>> GetActivities(int sessionId)
        {
            var userId = GetCurrentUserId();

            var parentSession = await _context.TrainingSessions.FindAsync(sessionId);

            if (parentSession == null || parentSession.UserId != userId) return Forbid();

            var activities = await _context.Activities
                                           .Where(a => a.TrainingSessionId == sessionId)
                                           .ToListAsync();
            return Ok(activities);
        }

        [HttpGet("activities/{id}")]
        public async Task<IActionResult> GetActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);

            if (activity == null) return NotFound();

            var userId = GetCurrentUserId();

            if (activity.UserId != userId) return Forbid();

            return Ok(activity);
        }

        [HttpPost("trainingsessions/{sessionId}/activities")]
        public async Task<ActionResult<Activity>> CreateActivity(CreateActivityDto activity, int sessionId)
        {
            var parentSession = await _context.TrainingSessions.FindAsync(sessionId);

            if (parentSession == null) return NotFound();

            var userId = GetCurrentUserId();

            if (parentSession.UserId != userId) return Forbid();

            var newActivity = new Activity
            {
                Name = activity.Name,
                DurationMinutes = activity.DurationMinutes,
                Category = activity.Category,
                Format = activity.Format,
                TrainingSessionId = sessionId,
                UserId = userId
            };

            _context.Activities.Add(newActivity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetActivity), new { id = newActivity.Id }, newActivity);
        }

        [HttpPut("activities/{id}")]
        public async Task<IActionResult> UpdateActivity(UpdateActivityDto activity, int id)
        {
            var userId = GetCurrentUserId();

            var activityDb = await _context.Activities.FindAsync(id);

            if (activityDb == null || activityDb.UserId != userId) return Forbid();

            activityDb.Name = activity.Name;
            activityDb.DurationMinutes = activity.DurationMinutes;
            activityDb.Category = activity.Category;
            activityDb.Format = activity.Format;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // This catch block handles a specific edge case:
                // It prevents a crash if the macrocycle being updated
                // was deleted by another user after it was loaded.

                if (!_context.Activities.Any(e => e.Id == id)) return NotFound();

                // If the entity still exists, the exception was for another reason.
                // Re-throw it to be handled globally.

                throw;
            }

            return NoContent();
        }

        [HttpDelete("activities/{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);

            if (activity == null) return NotFound();

            var userId = GetCurrentUserId();

            if (activity.UserId != userId) return Forbid();

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}