using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TrainingProgram.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace TrainingProgram.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserSport>()
                .HasKey(us => new { us.StaffUserId, us.SportId });

            modelBuilder.Entity<UserSport>()
                .HasOne(us => us.StaffUser)
                .WithMany(s => s.UserSports)
                .HasForeignKey(us => us.StaffUserId)
                .OnDelete(DeleteBehavior.ClientCascade);

            modelBuilder.Entity<UserSport>()
                .HasOne(us => us.Sport)
                .WithMany(s => s.UserSports)
                .HasForeignKey(us => us.SportId)
                .OnDelete(DeleteBehavior.ClientCascade);
        }

        public DbSet<Drill> Drills { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Macrocycle> Macrocycles { get; set; }
        public DbSet<Mesocycle> Mesocycles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Sport> Sports { get; set; }
        public DbSet<StaffUser> StaffUsers { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TrainingSession> TrainingSessions { get; set; }
        public DbSet<TrainingType> TrainingTypes { get; set; }
        public DbSet<TrainingVolume> TrainingVolumes { get; set; }
        public DbSet<UserSport> UserSports { get; set; }
        public DbSet<WeeklyMicrocycle> WeeklyMicrocycles { get; set; }
    }
}