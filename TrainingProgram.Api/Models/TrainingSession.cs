using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class TrainingSession
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public DateTime DateTime { get; set; }
        [Required]
        public int Duration { get; set; }
        public string Notes { get; set; }

        public int WeeklyMicrocycleId { get; set; }
        [ForeignKey("WeeklyMicrocycleId")]
        public WeeklyMicrocycle WeeklyMicrocycle { get; set; }
        [Required]
        public DayOfWeek DayOfWeek { get; set; }
        public int TrainingTypeId { get; set; }
        [ForeignKey("TrainingTypeId")]
        public TrainingType TrainingType { get; set; }

        public ICollection<Drill> Drills { get; set; } = new List<Drill>();


    }
}