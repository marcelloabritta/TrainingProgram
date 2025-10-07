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
        public DateTime Date { get; set; } // especif day of training
        [MaxLength(500)]
        public string? Notes { get; set; } //optional notes from the coach about the session goals or outcomes

        // Foreign Key for the Microcycle
        public int MicrocycleId { get; set; }
        public Microcycle Microcycle { get; set; }

        // The list of activities perfomed during this session
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();

        // Calculates the total duration of the session by summing up all its activities
        [NotMapped]
        public int TotalMinutes => Activities.Sum(a => a.DurationMinutes);
    }
}