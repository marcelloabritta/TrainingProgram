using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class WeeklyMicrocycle
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime StartDate { get; set; } // Ex: 02-04
        [Required]
        public DateTime EndDate { get; set; }  // Ex: 08-04
        [Required]
        public int WorkDays { get; set; }
        [Required]
        public int WorkSessions { get; set; }
        public int TotalMinutes { get; set; }

        public int MesocycleId { get; set; }
        [ForeignKey("MesocycleId")]
        public Mesocycle Mesocycle { get; set; }
        public ICollection<TrainingSession> Sessions { get; set; } = new List<TrainingSession>();
    }
}