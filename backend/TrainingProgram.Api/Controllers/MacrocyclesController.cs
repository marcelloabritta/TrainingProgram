using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrainingProgram.Api.Data;
using TrainingProgram.Api.Models;

namespace TrainingProgram.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MacrocyclesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MacrocyclesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Macrocycle>>> GetMacrocycles()
        {
            var macrocycles = await _context.Macrocycles
                                            .Include(m => m.Microcycles)
                                            .ToListAsync();

            return Ok(macrocycles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Macrocycle>> GetMacrocycle(int id)
        {
            var macrocycle = await _context.Macrocycles
                                            .Include(m => m.Microcycles)
                                            .ThenInclude(micro => micro.TrainingSessions)
                                            .ThenInclude(train => train.Activities)
                                            .FirstOrDefaultAsync(m => m.Id == id);
            if (macrocycle == null) return NotFound();

            return Ok(macrocycle);
        }

        [HttpPost]
        public async Task<ActionResult<Macrocycle>> CreateMacrocycle(Macrocycle macrocycle)
        {
            _context.Macrocycles.Add(macrocycle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMacrocycle), new { id = macrocycle.Id }, macrocycle);

        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateMacrocycle(Macrocycle macrocycle, int id)
        {
            if (id != macrocycle.Id) return BadRequest();

            _context.Entry(macrocycle).State = EntityState.Modified;

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

            _context.Macrocycles.Remove(macrocycle);
            await _context.SaveChangesAsync();

            return NoContent();

        }
    }
}