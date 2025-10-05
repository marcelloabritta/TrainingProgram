using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class StaffUser
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string FullName { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required] [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }

        public int TeamId { get; set; }
        [ForeignKey("TeamId")]
        public Team Team { get; set; }

        public int RoleId { get; set; }
        [ForeignKey("RoleId")]
        public Role Role { get; set; }
        public ICollection<UserSport> UserSports { get; set; } = new List<UserSport>();
        public string ProfilePhoto { get; set; }
    }
}