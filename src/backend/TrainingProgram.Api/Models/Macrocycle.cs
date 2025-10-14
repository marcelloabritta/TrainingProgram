using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class Macrocycle
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int Year { get; set; }
        [Required]
        [MaxLength(100)]
        public string TeamName { get; set; }
        [Required]
        [MaxLength(100)]
        public string CoachName { get; set; }

        // The ID of the user who owns this macrocycle. This create a link in te SupaBase Authentication
        [Required]
        public string UserId { get; set; }

        // The list of weekly training blocks (microcycles)
        public ICollection<Microcycle> Microcycles { get; set; } = new List<Microcycle>();

        // Calculates the total training duration of the entire macrocycle by summing up all its microcycles
        [NotMapped]
        public int TotalMinutes => Microcycles.Sum(m => m.TotalMinutes);
    }
}