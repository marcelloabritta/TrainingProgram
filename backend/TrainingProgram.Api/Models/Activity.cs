using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TrainingProgram.Api.Models
{
    public class Activity
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } // ex: ball controll, offensive system, strenght
        [Required]
        [Range(1, 600)] // max 600 minutes = 10 hours
        public int DurationMinutes { get; set; } // The duration of the activity in minutes

        [Required]
        public ActivityCategory Category { get; set; }
        [Required]
        public ActivityFormat Format { get; set; }
            
        [Required]    
        public string UserId { get; set; }

        //Foreing Key for TrainingSession
        public int TrainingSessionId { get; set; }
        public TrainingSession TrainingSession { get; set; }
    }

    // Defines the high-level category of a training activity
    public enum ActivityCategory
    {
        Technical,
        Tactical,
        Physical
    }

    public enum ActivityFormat
    {
        WarmUp,
        Drill,
        Scrimmage,
        FriendlyGame,
        OfficialGame,
        CoolDown,
        Recreational,
        Meeting
    }
}