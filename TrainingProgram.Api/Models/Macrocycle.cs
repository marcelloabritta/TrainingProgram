using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class Macrocycle
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Season { get; set; }
        [Required]
        public int TotalWeeks { get; set; }
        public int TotalSessions { get; set; }
        public int TotalVolumeMinutes { get; set; }
        public ICollection<Mesocycle> Mesocycles { get; set; } = new List<Mesocycle>();
        public ICollection<TrainingVolume> TrainingVolumes { get; set; } = new List<TrainingVolume>();
    }
}