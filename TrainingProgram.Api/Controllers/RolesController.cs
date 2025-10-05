using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TrainingProgram.Api.Data;
using TrainingProgram.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TrainingProgram.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RolesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            var model = await _context.Roles.ToListAsync();
            return Ok(model);
        }

        [HttpPost]
        public async Task<ActionResult<IEnumerable<Role>>> Create(Role model)
        {
            _context.Roles.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        } 
    }
}