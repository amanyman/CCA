const CaliforniaHeatMap = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 600"
        className="w-full h-auto max-h-[500px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* California Outline */}
        <path
          d="M 300 50 L 320 80 L 330 120 L 340 160 L 345 200 L 350 240 L 355 280 L 360 320 L 365 360 L 370 400 L 375 440 L 380 480 L 380 520 L 370 540 L 350 550 L 320 555 L 290 558 L 260 560 L 230 558 L 200 555 L 180 545 L 170 530 L 165 510 L 160 490 L 155 470 L 150 450 L 145 430 L 140 410 L 135 390 L 130 370 L 125 350 L 120 330 L 115 310 L 110 290 L 105 270 L 100 250 L 95 230 L 90 210 L 85 190 L 80 170 L 75 150 L 70 130 L 70 110 L 75 90 L 85 75 L 100 65 L 120 58 L 140 54 L 160 52 L 180 51 L 200 50 L 220 50 L 240 50 L 260 50 L 280 50 Z"
          fill="rgba(30, 58, 95, 0.1)"
          stroke="rgba(30, 58, 95, 0.3)"
          strokeWidth="2"
        />

        {/* Los Angeles Area - Large Heat Spot */}
        <g className="animate-pulse-slow">
          <circle cx="180" cy="450" r="40" fill="rgba(229, 57, 53, 0.15)" />
          <circle cx="180" cy="450" r="25" fill="rgba(229, 57, 53, 0.25)" />
          <circle cx="180" cy="450" r="12" fill="rgba(229, 57, 53, 0.5)" />
          <circle cx="180" cy="450" r="6" fill="rgba(229, 57, 53, 0.8)" />
        </g>

        {/* San Francisco Bay Area - Large Heat Spot */}
        <g className="animate-pulse-medium">
          <circle cx="150" cy="240" r="35" fill="rgba(229, 57, 53, 0.15)" />
          <circle cx="150" cy="240" r="22" fill="rgba(229, 57, 53, 0.25)" />
          <circle cx="150" cy="240" r="11" fill="rgba(229, 57, 53, 0.5)" />
          <circle cx="150" cy="240" r="5" fill="rgba(229, 57, 53, 0.8)" />
        </g>

        {/* San Diego Area - Medium Heat Spot */}
        <g className="animate-pulse-fast">
          <circle cx="200" cy="530" r="30" fill="rgba(229, 57, 53, 0.15)" />
          <circle cx="200" cy="530" r="18" fill="rgba(229, 57, 53, 0.25)" />
          <circle cx="200" cy="530" r="9" fill="rgba(229, 57, 53, 0.5)" />
          <circle cx="200" cy="530" r="4" fill="rgba(229, 57, 53, 0.8)" />
        </g>

        {/* Sacramento Area - Medium Heat Spot */}
        <g className="animate-pulse-medium-delayed">
          <circle cx="180" cy="200" r="28" fill="rgba(229, 57, 53, 0.15)" />
          <circle cx="180" cy="200" r="17" fill="rgba(229, 57, 53, 0.25)" />
          <circle cx="180" cy="200" r="8" fill="rgba(229, 57, 53, 0.5)" />
          <circle cx="180" cy="200" r="4" fill="rgba(229, 57, 53, 0.8)" />
        </g>

        {/* Fresno Area - Small Heat Spot */}
        <g className="animate-pulse-slow-delayed">
          <circle cx="210" cy="320" r="24" fill="rgba(229, 57, 53, 0.15)" />
          <circle cx="210" cy="320" r="15" fill="rgba(229, 57, 53, 0.25)" />
          <circle cx="210" cy="320" r="7" fill="rgba(229, 57, 53, 0.5)" />
          <circle cx="210" cy="320" r="3" fill="rgba(229, 57, 53, 0.8)" />
        </g>

        {/* Highway 5 Corridor - Small spots */}
        <g className="animate-pulse-fast-delayed">
          <circle cx="195" cy="280" r="18" fill="rgba(229, 57, 53, 0.12)" />
          <circle cx="195" cy="280" r="10" fill="rgba(229, 57, 53, 0.25)" />
          <circle cx="195" cy="280" r="5" fill="rgba(229, 57, 53, 0.4)" />
        </g>

        <g className="animate-pulse-medium">
          <circle cx="185" cy="380" r="20" fill="rgba(229, 57, 53, 0.12)" />
          <circle cx="185" cy="380" r="12" fill="rgba(229, 57, 53, 0.25)" />
          <circle cx="185" cy="380" r="6" fill="rgba(229, 57, 53, 0.4)" />
        </g>

        {/* City Labels */}
        <text x="180" y="470" fontSize="12" fill="white" textAnchor="middle" fontWeight="600">
          Los Angeles
        </text>
        <text x="150" y="260" fontSize="12" fill="white" textAnchor="middle" fontWeight="600">
          San Francisco
        </text>
        <text x="200" y="550" fontSize="12" fill="white" textAnchor="middle" fontWeight="600">
          San Diego
        </text>
        <text x="180" y="218" fontSize="11" fill="white" textAnchor="middle" fontWeight="600">
          Sacramento
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs font-semibold text-[#1e3a5f] mb-2">Accident Hotspots</div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-full bg-[#e53935] animate-pulse"></div>
          <span>High Activity Areas</span>
        </div>
      </div>
    </div>
  );
};

export default CaliforniaHeatMap;
