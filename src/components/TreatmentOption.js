import React from 'react';

const TreatmentOption = ({ option, isSelected, onClick }) => (
    <div className={`e-card${isSelected ? ' selected' : ''}`} onClick={() => onClick(option)}>
      <div className="e-card-image">
          <img src="https://parthadental.com/wp-content/uploads/2023/02/dental-implants-clinic-hyderabad-bangalore-750x750.jpg" alt="Dental Implant" />
      </div>
      <div className="e-card-content">
        {option}
      </div>
    </div>
  );
  
  export default TreatmentOption;
  
