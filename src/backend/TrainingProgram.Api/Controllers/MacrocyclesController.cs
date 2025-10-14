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
    [Route("api/[controller]")]
    [Authorize]
    public class MacrocyclesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MacrocyclesController(AppDbContext context)
        {
            _context = context;
        }

        // This read the Token and return his ID
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Macrocycle>>> GetMacrocycles()
        {
            var userId = GetCurrentUserId();

            var macrocycles = await _context.Macrocycles
                                            .Where(m => m.UserId == userId)
                                            .Include(m => m.Microcycles)
                                            .ToListAsync();

            return Ok(macrocycles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Macrocycle>> GetMacrocycle(int id)
        {
            var userId = GetCurrentUserId();

            var macrocycle = await _context.Macrocycles
                                            .Include(m => m.Microcycles)
                                            .ThenInclude(micro => micro.TrainingSessions)
                                            .ThenInclude(session => session.Activities)
                                            .FirstOrDefaultAsync(m => m.Id == id);
            if (macrocycle == null) return NotFound();

            if (macrocycle.UserId != userId) return Forbid(); // 403 Forbidden


            return Ok(macrocycle);
        }

        [HttpPost]
        public async Task<ActionResult<Macrocycle>> CreateMacrocycle(CreateMacrocycleDto macrocycle)
        {
            var userId = GetCurrentUserId();

            var newMacrocycle = new Macrocycle
            {
                Year = macrocycle.Year,
                TeamName = macrocycle.TeamName,
                CoachName = macrocycle.CoachName,
                UserId = userId
            };

            _context.Macrocycles.Add(newMacrocycle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMacrocycle), new { id = newMacrocycle.Id }, newMacrocycle);

        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateMacrocycle(UpdateMacrocycleDto macrocycle, int id)
        {
            var macrocycleDb = await _context.Macrocycles.FindAsync(id);

            if (macrocycleDb == null) return NotFound();

            var userId = GetCurrentUserId();

            if (macrocycleDb.UserId != userId) return Forbid(); // 403 Forbidden

            macrocycleDb.Year = macrocycle.Year;
            macrocycleDb.TeamName = macrocycle.TeamName;
            macrocycleDb.CoachName = macrocycle.CoachName;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // This catch block handles a specific edge case:
                // It prevents a crash if the macrocycle being updated
                // was deleted by another user after it was loaded.

                if (!_context.Macrocycles.Any(e => e.Id == id)) return NotFound();

                // If the entity still exists, the exception was for another reason.
                // Re-throw it to be handled globally.

                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMacrocycle(int id)
        {
            var macrocycle = await _context.Macrocycles.FindAsync(id);


            if (macrocycle == null) return NotFound();

            var userId = GetCurrentUserId();
            if (macrocycle.UserId != userId) return Forbid(); // 403 Forbidden

            _context.Macrocycles.Remove(macrocycle);
            await _context.SaveChangesAsync();

            return NoContent();

        }
    }
}