using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Dtos
{
    public class UpdateSessionDto
    {
        [Required]
        public DateTime Date { get; set; } // Especific day

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}