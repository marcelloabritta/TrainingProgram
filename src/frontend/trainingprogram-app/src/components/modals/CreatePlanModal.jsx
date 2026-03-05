import React, { useState } from "react";
import InputField from "../ui/InputField";
import PrimaryButton from "../ui/PrimaryButton";
import FeedbackMessage from "../ui/FeedbackMessage";
import { supabase } from "../../config/supabaseClient";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { add, endOfWeek, format, startOfWeek } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCalendarAlt, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const renderCustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
}) => {
    const years = [];
    for (let i = 1990; i <= new Date().getFullYear() + 10; i++) {
        years.push(i);
    }
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    return (
        <div className="custom-datepicker-header">
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="custom-header-button"
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="custom-header-selectors">
                <select
                    value={months[date.getMonth()]}
                    onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                    className="custom-header-select"
                >
                    {months.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <select
                    value={date.getFullYear()}
                    onChange={({ target: { value } }) => changeYear(parseInt(value))}
                    className="custom-header-select"
                >
                    {years.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="custom-header-button"
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    );
};

const CreatePlanModal = ({ isOpen, onClose, onSave, session }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [duration, setDuration] = useState(52);
    const [teamName, setTeamName] = useState("");
    const [coachName, setCoachName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    if (!isOpen) return null;

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        const user = session?.user;
        if (!user) return;

        setLoading(true);
        setMessage("");

        const microcyclesToCreate = [];
        const firstWeekStartDate = startDate;

        for (let i = 0; i < duration; i++) {
            const currentweekStartDate = add(firstWeekStartDate, { weeks: i });
            const weekStart = startOfWeek(currentweekStartDate, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(currentweekStartDate, { weekStartsOn: 1 });

            const newWeek = {
                WeekNumber: i + 1,
                StartDate: format(weekStart, 'yyyy-MM-dd'),
                EndDate: format(weekEnd, 'yyyy-MM-dd'),
                UserId: user.id
            };
            microcyclesToCreate.push(newWeek);
        }

        const newPlan = {
            Year: startDate.getFullYear(),
            TeamName: teamName,
            CoachName: coachName,
            UserId: user.id,
            Duration: duration,
            StartDate: format(startDate, 'yyyy-MM-dd'),
        };

        const { error } = await supabase
            .rpc('create_plan_with_weeks', {
                plan_data: newPlan,
                weeks_data: microcyclesToCreate
            });

        setLoading(false);

        if (error) {
            console.error("Error creating plan:", error);
            setIsError(true);
            setMessage("Failed to create plan. Please try again.");
        } else {
            setIsError(false);
            setMessage("Plan created successfully!");
            if (onSave) onSave();
            setTimeout(onClose, 1000);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-[#111827]/90 border border-gray-700/50 backdrop-blur-xl w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Create New Plan</h2>
                        <p className="text-gray-400 text-sm font-medium">Define your training season</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleCreatePlan} className="space-y-5">
                        <InputField
                            label="Team Name"
                            type="text"
                            placeholder="Team Name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 focus:border-[#B2E642] p-4 text-base"
                            labelClassName="text-gray-400 text-xs font-bold uppercase tracking-widest"
                            required
                        />

                        <InputField
                            label="Coach Name"
                            type="text"
                            placeholder="Coach Name"
                            value={coachName}
                            onChange={(e) => setCoachName(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 focus:border-[#B2E642] p-4 text-base"
                            labelClassName="text-gray-400 text-xs font-bold uppercase tracking-widest"
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Duration (Weeks)"
                                type="number"
                                placeholder="Ex: 52"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="bg-gray-800/50 border-gray-700 focus:border-[#B2E642] p-4 text-base"
                                labelClassName="text-gray-400 text-xs font-bold uppercase tracking-widest"
                                required
                            />

                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-1">Start Date</label>
                                <div className="relative group">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-12 py-4 text-white text-base font-medium focus:border-[#B2E642] focus:ring-1 focus:ring-[#B2E642] outline-none transition-all cursor-pointer group-hover:border-gray-600"
                                        dateFormat="dd/MM/yyyy"
                                        popperClassName="custom-datepicker-popper"
                                        portalId="root"
                                        renderCustomHeader={renderCustomHeader}
                                        popperPlacement="bottom"
                                    />
                                    <FontAwesomeIcon
                                        icon={faCalendarAlt}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B2E642] text-lg pointer-events-none group-hover:scale-110 transition-transform"
                                    />
                                </div>
                            </div>
                        </div>

                        <FeedbackMessage message={message} isError={isError} />

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 px-6 rounded-2xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <PrimaryButton
                                className={`flex-[2] py-4 text-lg font-black shadow-[0_0_20px_rgba(178,230,66,0.2)] ${loading ? 'opacity-70 cursor-wait' : ''}`}
                                onClick={loading ? (e) => e.preventDefault() : undefined}
                            >
                                {loading ? 'Creating...' : 'Create Plan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePlanModal;
