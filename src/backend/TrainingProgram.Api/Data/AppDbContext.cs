using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TrainingProgram.Api.Models;

namespace TrainingProgram.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<Macrocycle> Macrocycles { get; set; }
        public DbSet<Microcycle> Microcycles { get; set; }
        public DbSet<TrainingSession> TrainingSessions { get; set; }
        public DbSet<Activity> Activities { get; set; }
    }
}