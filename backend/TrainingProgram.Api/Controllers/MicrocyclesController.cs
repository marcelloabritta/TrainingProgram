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
    public class MicrocyclesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MicrocyclesController(AppDbContext context)
        {
            _context = context;
        }

        // This read the Token and return his ID
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        }


        [HttpGet("macrocycles/{macrocycleId}/microcycles")]
        public async Task<ActionResult<IEnumerable<Microcycle>>> GetMicrocyclesForMacrocycle(int macrocycleId)
        {
            var userId = GetCurrentUserId();

            var parentMacrocycle = await _context.Macrocycles.FindAsync(macrocycleId);

            if (parentMacrocycle == null || parentMacrocycle.UserId != userId) return Forbid();


            var microcycles = await _context.Microcycles
                                            .Where(m => m.MacrocycleId == macrocycleId)
                                            .Include(m => m.TrainingSessions)
                                            .ThenInclude(ts => ts.Activities)
                                            .ToListAsync();

            return Ok(microcycles);
        }

        [HttpGet("microcycles/{id}")]
        public async Task<ActionResult<Microcycle>> GetMicrocycle(int id)
        {
            var microcycle = await _context.Microcycles
                                            .Include(m => m.TrainingSessions)
                                            .ThenInclude(ts => ts.Activities)
                                            .FirstOrDefaultAsync(m => m.Id == id);

            if (microcycle == null) return NotFound();

            var userId = GetCurrentUserId();

            if (microcycle.UserId != userId) return Forbid();

            return Ok(microcycle);
        }

        [HttpPost("macrocycles/{macrocycleId}/microcycles")]
        public async Task<ActionResult<Microcycle>> CreateMicrocycle(CreateMicrocycleDto microcycle, int macrocycleId)
        {
            var userId = GetCurrentUserId();

            var parentMacrocycle = await _context.Macrocycles.FindAsync(macrocycleId);

            if (parentMacrocycle == null || parentMacrocycle.UserId != userId) return Forbid();

            var newMicrocycle = new Microcycle
            {
                WeekNumber = microcycle.WeekNumber,
                StartDate = microcycle.StartDate,
                EndDate = microcycle.EndDate,
                MacrocycleId = macrocycleId,
                UserId = userId
            };

            _context.Microcycles.Add(newMicrocycle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMicrocycle), new { id = newMicrocycle.Id}, newMicrocycle);
        }

        [HttpPut("microcycles/{id}")]
        public async Task<IActionResult> UpdateMicrocycle(UpdateMicrocycleDto microcycle, int id)
        {
            var userId = GetCurrentUserId();

            var microcycleDb = await _context.Microcycles.FindAsync(id);

            if (microcycleDb == null || microcycleDb.UserId != userId) return Forbid();

            microcycleDb.WeekNumber = microcycle.WeekNumber;
            microcycleDb.StartDate = microcycle.StartDate;
            microcycleDb.EndDate = microcycle.EndDate;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // This catch block handles a specific edge case:
                // It prevents a crash if the macrocycle being updated
                // was deleted by another user after it was loaded.

                if (!_context.Microcycles.Any(e => e.Id == id)) return NotFound();

                // If the entity still exists, the exception was for another reason.
                // Re-throw it to be handled globally.

                throw;
            }

            return NoContent();
        }

        [HttpDelete("microcycles/{id}")]
        public async Task<IActionResult> DeleteMicrocyle(int id)
        {
            var microcycle = await _context.Microcycles.FindAsync(id);

            if (microcycle == null) return NotFound();

            var userId = GetCurrentUserId();

            if (microcycle.UserId != userId) return Forbid();

            _context.Microcycles.Remove(microcycle);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}