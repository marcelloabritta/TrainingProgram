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
    public class TrainingSessionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TrainingSessionsController(AppDbContext context)
        {
            _context = context;
        }

        // This read the Token and return his ID
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        }


        [HttpGet("microcycles/{semanaId}/trainingsessions")]
        public async Task<ActionResult<IEnumerable<TrainingSession>>> GetSessionsForMicrocycle(int semanaId)
        {
            var userId = GetCurrentUserId();

            var parentMicrocycle = await _context.Microcycles.FindAsync(semanaId);

            if (parentMicrocycle == null || parentMicrocycle.UserId != userId) return Forbid();

            var sessions = await _context.TrainingSessions
                                         .Where(t => t.MicrocycleId == semanaId)
                                         .Include(t => t.Activities)
                                         .ToListAsync();

            return Ok(sessions);
        }

        [HttpGet("trainingsessions/{id}")]
        public async Task<IActionResult> GetSession(int id)
        {
            var session = await _context.TrainingSessions
                                        .Include(t => t.Activities)
                                        .FirstOrDefaultAsync(t => t.Id == id);

            if (session == null) return NotFound();

            var userId = GetCurrentUserId();

            if (session.UserId != userId) return Forbid();

            return Ok(session);
        }

        [HttpPost("microcycles/{semanaId}/trainingsessions")]
        public async Task<ActionResult<TrainingSession>> CreateSession(CreateSessionDto session, int semanaId)
        {
            var parentMicrocycle = await _context.Microcycles.FindAsync(semanaId);

            if (parentMicrocycle == null) return NotFound();

            var userId = GetCurrentUserId();

            if (parentMicrocycle.UserId != userId) return Forbid();

            var newSession = new TrainingSession
            {
                Date = session.Date,
                Notes = session.Notes,
                MicrocycleId = semanaId,
                UserId = userId
            };

            _context.TrainingSessions.Add(newSession);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSession), new { id = newSession.Id }, newSession);
        }

        [HttpPut("trainingsessions/{id}")]
        public async Task<IActionResult> UpdateSession(UpdateSessionDto session, int id)
        {
            var userId = GetCurrentUserId();

            var sessionDb = await _context.TrainingSessions.FindAsync(id);

            if (sessionDb == null || sessionDb.UserId != userId) return Forbid();

            sessionDb.Date = session.Date;
            sessionDb.Notes = session.Notes;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // This catch block handles a specific edge case:
                // It prevents a crash if the macrocycle being updated
                // was deleted by another user after it was loaded.

                if (!_context.TrainingSessions.Any(e => e.Id == id)) return NotFound();

                // If the entity still exists, the exception was for another reason.
                // Re-throw it to be handled globally.

                throw;
            }

            return NoContent();
        }

        [HttpDelete("trainingsessions/{id}")]
        public async Task<IActionResult> DeleteSession(int id)
        {
            var session = await _context.TrainingSessions.FindAsync(id);

            if (session == null) return NotFound();

            var userId = GetCurrentUserId();

            if (session.UserId != userId) return Forbid();

            _context.TrainingSessions.Remove(session);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}