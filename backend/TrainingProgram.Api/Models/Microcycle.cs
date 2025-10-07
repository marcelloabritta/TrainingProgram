using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class Microcycle
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Range(1, 53)]
        public int WeekNumber { get; set; }
        [Required]
        public DateTime StartDate { get; set; } // ex: 02/03
        [Required]
        public DateTime EndDate { get; set; } // ex: 09/03

        // ForeignKey for Macrocycle
        public int MacrocycleId { get; set; }
        public Macrocycle Macrocycle { get; set; }

        // The list of training session scheduled for this microcycle
        public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();

        // Calculates the total training duration of the entire microcycle by summing up all its sessions
        [NotMapped]
        public int TotalMinutes => TrainingSessions.Sum(s => s.TotalMinutes);
    }
}