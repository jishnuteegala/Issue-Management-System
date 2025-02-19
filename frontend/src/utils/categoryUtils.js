export const getCategoryOptions = () => {
    return [
        { value: 'pothole', label: 'Pothole' },
        { value: 'street_lighting', label: 'Street Lighting' },
        { value: 'graffiti', label: 'Graffiti' },
        { value: 'anti_social', label: 'Anti-Social Behaviour' },
        { value: 'fly_tipping', label: 'Fly-Tipping' },
        { value: 'blocked_drain', label: 'Blocked Drains' },
    ];
};

export const getCategoryDisplayName = (category) => {
    const categoryMap = {
        pothole: 'Pothole',
        street_lighting: 'Street Lighting',
        graffiti: 'Graffiti',
        anti_social: 'Anti-Social Behaviour',
        fly_tipping: 'Fly-Tipping',
        blocked_drain: 'Blocked Drains',
    };

    return categoryMap[category] || category;
};