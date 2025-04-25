// src/components/Calendar.jsx
import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { addDays, differenceInDays, format } from 'date-fns';
import { DateTime } from 'luxon';
import { useTimezones } from '../hooks/useTimezones';
import { fetchTimezones } from '../services/api';
import { 
  DATE_MESSAGES, 
  MAX_DAYS_SELECTION, 
  MAX_PAST_DAYS,
  DEFAULT_TIMEZONE 
} from '../constants';
import './Calendar.css';

// Memoized DatePicker component for better performance
const MemoizedDatePicker = memo(({ 
  startDate, 
  endDate, 
  onChange, 
  isDateDisabled, 
  renderDayContents 
}) => (
  <DatePicker
    selected={startDate}
    onChange={onChange}
    startDate={startDate}
    endDate={endDate}
    selectsRange
    inline
    filterDate={date => !isDateDisabled(date)}
    renderDayContents={renderDayContents}
  />
));

const Calendar = ({ onDateRangeChange }) => {
  // Use our custom timezone hook
  const { 
    timeZones, 
    selectedTimeZone, 
    setSelectedTimeZone 
  } = useTimezones(fetchTimezones, DEFAULT_TIMEZONE);
  
  // Local state
  const [startDate, setStartDate] = useState(addDays(new Date(), -7));
  const [endDate, setEndDate] = useState(new Date());
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Memoized format date function
  const formatDateWithTimeZone = useCallback((date, timezone, formatStr) => {
    if (!date) return '';
    return DateTime.fromJSDate(date).setZone(timezone).toFormat(formatStr);
  }, []);

  // Use effect to notify parent component when dates or timezone changes
  useEffect(() => {
    // Only notify if we have all necessary values
    if (startDate && endDate && selectedTimeZone && selectedTimeZone.value) {
      const formattedStartDate = formatDateWithTimeZone(
        startDate,
        selectedTimeZone.value,
        'yyyy-MM-dd HH:mm:ss ZZ'
      );
      
      const formattedEndDate = formatDateWithTimeZone(
        endDate,
        selectedTimeZone.value,
        'yyyy-MM-dd HH:mm:ss ZZ'
      );
      
      // Call the parent's handler
      onDateRangeChange({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        timeZone: selectedTimeZone.value
      });
      
      console.log('Date range changed:', { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate,
        timeZone: selectedTimeZone.value
      });
    }
  }, [startDate, endDate, selectedTimeZone, formatDateWithTimeZone, onDateRangeChange]);

  // Date change handler
  const handleDateChange = useCallback((dates) => {
    const [start, end] = dates;
    
    // Check if the range exceeds MAX_DAYS_SELECTION
    if (start && end && differenceInDays(end, start) > MAX_DAYS_SELECTION - 1) {
      setTooltipMessage(`Maximum ${MAX_DAYS_SELECTION} days allowed for selection`);
      setShowTooltip(true);
      return;
    }
    
    // Update state directly - useEffect will handle notifying parent
    setStartDate(start);
    setEndDate(end);
    setShowTooltip(false);
  }, []);

  // Time zone change handler
  const handleTimeZoneChange = useCallback((selectedOption) => {
    setSelectedTimeZone(selectedOption);
    // The useEffect will handle notifying the parent
  }, [setSelectedTimeZone]);

  // Date disable checker
  const isDateDisabled = useCallback((date) => {
    // Disable dates more than MAX_PAST_DAYS in the past
    const minDate = addDays(new Date(), -MAX_PAST_DAYS);
    if (date < minDate) return true;
    
    // Check for disabled dates in DATE_MESSAGES
    const dateKey = format(date, 'yyyy-MM-dd');
    return DATE_MESSAGES[dateKey]?.disabled === true;
  }, []);

  // Date hover handler
  const handleDateHover = useCallback((date, event) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dateInfo = DATE_MESSAGES[dateKey];
    
    if (dateInfo?.message) {
      // Create a more informative message that includes disabled status
      const status = dateInfo.disabled ? '🚫 Date Disabled' : '✓ Date Available';
      const fullMessage = `${dateInfo.message}\n${status}`;
      
      setTooltipMessage(fullMessage);
      
      // Position the tooltip more intelligently
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 5 // 5px below the element
      });
      
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, []);

  // Day content renderer
  const renderDayContents = useCallback((day, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const hasMessage = DATE_MESSAGES[dateKey]?.message;
    const isDisabled = DATE_MESSAGES[dateKey]?.disabled;
    
    return (
      <div 
        className={`${hasMessage ? 'has-message' : ''} ${isDisabled ? 'disabled-date' : ''}`}
        onMouseOver={(e) => handleDateHover(date, e)}
        onMouseOut={() => setShowTooltip(false)}
      >
        {day}
      </div>
    );
  }, [handleDateHover]);

  // Memoized formatted dates for display
  const formattedStartDate = useMemo(() => 
    formatDateWithTimeZone(startDate, selectedTimeZone.value, 'yyyy-MM-dd'),
    [startDate, selectedTimeZone.value, formatDateWithTimeZone]
  );
  
  const formattedEndDate = useMemo(() => 
    formatDateWithTimeZone(endDate, selectedTimeZone.value, 'yyyy-MM-dd'),
    [endDate, selectedTimeZone.value, formatDateWithTimeZone]
  );

  return (
    <div className="calendar-container">
      <h2>Select Date Range</h2>
      
      <div className="timezone-selector">
        <label>Time Zone:</label>
        <Select
          value={selectedTimeZone}
          onChange={handleTimeZoneChange}
          options={timeZones}
          className="timezone-dropdown"
          isSearchable
        />
      </div>
      
      <div className="date-picker-container">
        <MemoizedDatePicker
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          isDateDisabled={isDateDisabled}
          renderDayContents={renderDayContents}
        />
      </div>
      
      <div className="selected-dates">
        <p>Selected Range: {formattedStartDate} to {formattedEndDate}</p>
      </div>
      
      {/* Legend explaining special dates */}
      <div className="calendar-legend">
        <h4>Calendar Legend</h4>
        <div className="legend-item">
          <div className="legend-color legend-disabled"></div>
          <span>Disabled Date (Holiday or Maintenance)</span>
        </div>
      </div>
      
      {showTooltip && (
        <div 
          className="tooltip" 
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10
          }}
        >
          {tooltipMessage}
        </div>
      )}
    </div>
  );
};

// Export a memoized version of the component
export default memo(Calendar);