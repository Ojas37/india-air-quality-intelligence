import React, { useState, useRef, useEffect } from 'react';
import { Wind, Clock, BarChart2, TrendingUp, Search, MapPin, X } from 'lucide-react';
import MapContainer from '../components/map/MapContainer';
import PollutantCard from '../components/common/PollutantCard';
import {
  defaultMapLayers,
  pollutantReadings,
  hourlyData,
  regionalAQI,
  getAQICategory,
  getCategoryColor,
} from '../data/mockData';
import type { MapLayer, PollutantReading, RegionalAQI, AQICategory } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatusBadge from '../components/common/StatusBadge';

// ── Extended location database (cities + small towns/villages) ──────────────
const LOCATION_DATABASE: RegionalAQI[] = [
  ...regionalAQI,
  { region: 'Varanasi', aqi: 198, pm25: 108, pm10: 162, no2: 54, so2: 19, co: 2.3, o3: 43, status: 'Moderate', trend: 'up', lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
  { region: 'Agra', aqi: 212, pm25: 120, pm10: 178, no2: 58, so2: 21, co: 2.6, o3: 41, status: 'Poor', trend: 'up', lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  { region: 'Kanpur', aqi: 243, pm25: 144, pm10: 206, no2: 65, so2: 24, co: 2.9, o3: 40, status: 'Poor', trend: 'up', lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  { region: 'Surat', aqi: 142, pm25: 74, pm10: 118, no2: 38, so2: 13, co: 1.7, o3: 56, status: 'Moderate', trend: 'stable', lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  { region: 'Vadodara', aqi: 136, pm25: 70, pm10: 112, no2: 35, so2: 12, co: 1.6, o3: 54, status: 'Moderate', trend: 'down', lat: 22.3072, lng: 73.1812, state: 'Gujarat' },
  { region: 'Rajkot', aqi: 128, pm25: 65, pm10: 104, no2: 32, so2: 11, co: 1.4, o3: 52, status: 'Moderate', trend: 'stable', lat: 22.3039, lng: 70.8022, state: 'Gujarat' },
  { region: 'Nagpur', aqi: 122, pm25: 63, pm10: 98, no2: 30, so2: 10, co: 1.3, o3: 50, status: 'Moderate', trend: 'down', lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  { region: 'Nashik', aqi: 104, pm25: 52, pm10: 84, no2: 26, so2: 8, co: 1.1, o3: 47, status: 'Moderate', trend: 'stable', lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  { region: 'Aurangabad', aqi: 116, pm25: 59, pm10: 93, no2: 29, so2: 9, co: 1.2, o3: 48, status: 'Moderate', trend: 'stable', lat: 19.8762, lng: 75.3433, state: 'Maharashtra' },
  { region: 'Bhopal', aqi: 132, pm25: 68, pm10: 108, no2: 34, so2: 11, co: 1.5, o3: 51, status: 'Moderate', trend: 'stable', lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  { region: 'Indore', aqi: 126, pm25: 64, pm10: 102, no2: 31, so2: 10, co: 1.4, o3: 49, status: 'Moderate', trend: 'down', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  { region: 'Coimbatore', aqi: 78, pm25: 33, pm10: 57, no2: 15, so2: 5, co: 0.7, o3: 38, status: 'Satisfactory', trend: 'down', lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  { region: 'Madurai', aqi: 84, pm25: 37, pm10: 62, no2: 17, so2: 5, co: 0.8, o3: 39, status: 'Satisfactory', trend: 'stable', lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  { region: 'Visakhapatnam', aqi: 96, pm25: 46, pm10: 74, no2: 22, so2: 7, co: 0.9, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  { region: 'Vijayawada', aqi: 102, pm25: 51, pm10: 82, no2: 25, so2: 8, co: 1.0, o3: 44, status: 'Moderate', trend: 'stable', lat: 16.5062, lng: 80.648, state: 'Andhra Pradesh' },
  { region: 'Amritsar', aqi: 218, pm25: 124, pm10: 182, no2: 59, so2: 20, co: 2.7, o3: 41, status: 'Poor', trend: 'up', lat: 31.634, lng: 74.8723, state: 'Punjab' },
  { region: 'Ludhiana', aqi: 226, pm25: 130, pm10: 192, no2: 62, so2: 22, co: 2.8, o3: 40, status: 'Poor', trend: 'up', lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  { region: 'Jodhpur', aqi: 168, pm25: 89, pm10: 138, no2: 46, so2: 16, co: 2.1, o3: 44, status: 'Moderate', trend: 'stable', lat: 26.2389, lng: 73.0243, state: 'Rajasthan' },
  { region: 'Udaipur', aqi: 112, pm25: 56, pm10: 90, no2: 27, so2: 9, co: 1.2, o3: 46, status: 'Moderate', trend: 'down', lat: 24.5854, lng: 73.7125, state: 'Rajasthan' },
  { region: 'Dehradun', aqi: 88, pm25: 41, pm10: 68, no2: 20, so2: 6, co: 0.9, o3: 43, status: 'Satisfactory', trend: 'down', lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' },
  { region: 'Haridwar', aqi: 98, pm25: 48, pm10: 78, no2: 24, so2: 7, co: 1.0, o3: 45, status: 'Satisfactory', trend: 'stable', lat: 29.9457, lng: 78.1642, state: 'Uttarakhand' },
  { region: 'Guwahati', aqi: 118, pm25: 60, pm10: 95, no2: 29, so2: 9, co: 1.3, o3: 47, status: 'Moderate', trend: 'stable', lat: 26.1445, lng: 91.7362, state: 'Assam' },
  { region: 'Bhubaneswar', aqi: 94, pm25: 45, pm10: 73, no2: 22, so2: 7, co: 0.9, o3: 42, status: 'Satisfactory', trend: 'down', lat: 20.2961, lng: 85.8245, state: 'Odisha' },
  { region: 'Ranchi', aqi: 108, pm25: 54, pm10: 87, no2: 26, so2: 8, co: 1.1, o3: 45, status: 'Moderate', trend: 'stable', lat: 23.3441, lng: 85.3096, state: 'Jharkhand' },
  { region: 'Raipur', aqi: 134, pm25: 69, pm10: 110, no2: 35, so2: 12, co: 1.5, o3: 50, status: 'Moderate', trend: 'stable', lat: 21.2514, lng: 81.6296, state: 'Chhattisgarh' },
  { region: 'Shimla', aqi: 42, pm25: 14, pm10: 28, no2: 8, so2: 2, co: 0.3, o3: 32, status: 'Good', trend: 'down', lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh' },
  { region: 'Manali', aqi: 22, pm25: 6, pm10: 14, no2: 4, so2: 1, co: 0.2, o3: 28, status: 'Good', trend: 'stable', lat: 32.2396, lng: 77.1887, state: 'Himachal Pradesh' },
  { region: 'Ooty', aqi: 32, pm25: 10, pm10: 20, no2: 6, so2: 2, co: 0.3, o3: 30, status: 'Good', trend: 'stable', lat: 11.4102, lng: 76.695, state: 'Tamil Nadu' },
  { region: 'Port Blair', aqi: 28, pm25: 8, pm10: 16, no2: 5, so2: 1, co: 0.2, o3: 26, status: 'Good', trend: 'stable', lat: 11.6234, lng: 92.7265, state: 'Andaman & Nicobar' },
  // Villages / Small towns
  { region: 'Sonipat', aqi: 234, pm25: 138, pm10: 196, no2: 63, so2: 22, co: 2.8, o3: 40, status: 'Poor', trend: 'up', lat: 28.9931, lng: 77.0151, state: 'Haryana' },
  { region: 'Panipat', aqi: 222, pm25: 128, pm10: 186, no2: 60, so2: 21, co: 2.7, o3: 41, status: 'Poor', trend: 'up', lat: 29.3909, lng: 76.9635, state: 'Haryana' },
  { region: 'Rohtak', aqi: 216, pm25: 123, pm10: 181, no2: 58, so2: 20, co: 2.6, o3: 41, status: 'Poor', trend: 'up', lat: 28.8955, lng: 76.6066, state: 'Haryana' },
  { region: 'Meerut', aqi: 228, pm25: 132, pm10: 191, no2: 61, so2: 21, co: 2.7, o3: 40, status: 'Poor', trend: 'up', lat: 28.9845, lng: 77.7064, state: 'Uttar Pradesh' },
  { region: 'Ghaziabad', aqi: 268, pm25: 158, pm10: 226, no2: 70, so2: 24, co: 3.0, o3: 44, status: 'Poor', trend: 'up', lat: 28.6692, lng: 77.4538, state: 'Uttar Pradesh' },
  { region: 'Firozabad', aqi: 184, pm25: 98, pm10: 152, no2: 52, so2: 18, co: 2.2, o3: 42, status: 'Moderate', trend: 'stable', lat: 27.1592, lng: 78.3957, state: 'Uttar Pradesh' },
  { region: 'Aligarh', aqi: 196, pm25: 106, pm10: 164, no2: 55, so2: 19, co: 2.3, o3: 42, status: 'Moderate', trend: 'up', lat: 27.8974, lng: 78.088, state: 'Uttar Pradesh' },
  { region: 'Muzaffarpur', aqi: 238, pm25: 141, pm10: 202, no2: 65, so2: 22, co: 2.9, o3: 41, status: 'Poor', trend: 'up', lat: 26.1209, lng: 85.3647, state: 'Bihar' },
  { region: 'Gaya', aqi: 218, pm25: 124, pm10: 183, no2: 59, so2: 20, co: 2.7, o3: 41, status: 'Poor', trend: 'up', lat: 24.7955, lng: 85.0002, state: 'Bihar' },
  { region: 'Bhagalpur', aqi: 186, pm25: 100, pm10: 155, no2: 53, so2: 18, co: 2.2, o3: 42, status: 'Moderate', trend: 'stable', lat: 25.2425, lng: 86.9842, state: 'Bihar' },
  { region: 'Siliguri', aqi: 138, pm25: 71, pm10: 114, no2: 36, so2: 12, co: 1.6, o3: 52, status: 'Moderate', trend: 'stable', lat: 26.7271, lng: 88.3953, state: 'West Bengal' },
  { region: 'Durgapur', aqi: 168, pm25: 89, pm10: 138, no2: 46, so2: 16, co: 2.0, o3: 46, status: 'Moderate', trend: 'stable', lat: 23.4800, lng: 87.3119, state: 'West Bengal' },
  { region: 'Palghar', aqi: 124, pm25: 63, pm10: 100, no2: 31, so2: 10, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 19.6967, lng: 72.7659, state: 'Maharashtra' },
  { region: 'Latur', aqi: 98, pm25: 48, pm10: 78, no2: 24, so2: 7, co: 1.0, o3: 45, status: 'Satisfactory', trend: 'stable', lat: 18.4088, lng: 76.5604, state: 'Maharashtra' },
  { region: 'Nanded', aqi: 106, pm25: 53, pm10: 85, no2: 26, so2: 8, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 19.1383, lng: 77.321, state: 'Maharashtra' },
  { region: 'Bellary', aqi: 116, pm25: 59, pm10: 93, no2: 29, so2: 10, co: 1.2, o3: 48, status: 'Moderate', trend: 'stable', lat: 15.1394, lng: 76.9214, state: 'Karnataka' },
  { region: 'Mysuru', aqi: 74, pm25: 31, pm10: 54, no2: 14, so2: 4, co: 0.6, o3: 36, status: 'Satisfactory', trend: 'down', lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  { region: 'Kochi', aqi: 68, pm25: 27, pm10: 48, no2: 13, so2: 4, co: 0.6, o3: 35, status: 'Satisfactory', trend: 'down', lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  { region: 'Thiruvananthapuram', aqi: 62, pm25: 24, pm10: 43, no2: 11, so2: 3, co: 0.5, o3: 33, status: 'Satisfactory', trend: 'stable', lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  { region: 'Kozhikode', aqi: 58, pm25: 22, pm10: 40, no2: 10, so2: 3, co: 0.5, o3: 32, status: 'Satisfactory', trend: 'stable', lat: 11.2588, lng: 75.7804, state: 'Kerala' },
  { region: 'Gangtok', aqi: 34, pm25: 11, pm10: 21, no2: 6, so2: 2, co: 0.3, o3: 29, status: 'Good', trend: 'stable', lat: 27.3389, lng: 88.6065, state: 'Sikkim' },
  { region: 'Imphal', aqi: 48, pm25: 18, pm10: 33, no2: 9, so2: 2, co: 0.4, o3: 31, status: 'Good', trend: 'stable', lat: 24.817, lng: 93.9368, state: 'Manipur' },
  { region: 'Aizawl', aqi: 36, pm25: 12, pm10: 23, no2: 7, so2: 2, co: 0.3, o3: 29, status: 'Good', trend: 'stable', lat: 23.7307, lng: 92.7173, state: 'Mizoram' },
  { region: 'Agartala', aqi: 82, pm25: 36, pm10: 60, no2: 16, so2: 5, co: 0.8, o3: 40, status: 'Satisfactory', trend: 'stable', lat: 23.8315, lng: 91.2868, state: 'Tripura' },
  { region: 'Shillong', aqi: 44, pm25: 15, pm10: 29, no2: 8, so2: 2, co: 0.3, o3: 30, status: 'Good', trend: 'stable', lat: 25.5788, lng: 91.8933, state: 'Meghalaya' },
  // Notable villages / tehsils
  { region: 'Dharavi', aqi: 172, pm25: 92, pm10: 141, no2: 47, so2: 16, co: 2.0, o3: 52, status: 'Moderate', trend: 'stable', lat: 19.044, lng: 72.853, state: 'Maharashtra' },
  { region: 'Noida', aqi: 272, pm25: 162, pm10: 229, no2: 72, so2: 25, co: 3.1, o3: 45, status: 'Poor', trend: 'up', lat: 28.5355, lng: 77.391, state: 'Uttar Pradesh' },
  { region: 'Gurugram', aqi: 264, pm25: 156, pm10: 222, no2: 69, so2: 24, co: 3.0, o3: 45, status: 'Poor', trend: 'up', lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  { region: 'Faridabad', aqi: 258, pm25: 152, pm10: 218, no2: 67, so2: 23, co: 2.9, o3: 44, status: 'Poor', trend: 'up', lat: 28.4089, lng: 77.3178, state: 'Haryana' },
  { region: 'Rishikesh', aqi: 72, pm25: 30, pm10: 52, no2: 13, so2: 4, co: 0.6, o3: 38, status: 'Satisfactory', trend: 'down', lat: 30.0869, lng: 78.2676, state: 'Uttarakhand' },

  // ── Maharashtra — Districts, Talukas & Villages ──────────────────────────
  // Konkan Division
  { region: 'Satara', aqi: 96, pm25: 46, pm10: 75, no2: 22, so2: 7, co: 0.9, o3: 44, status: 'Satisfactory', trend: 'stable', lat: 17.6868, lng: 74.0183, state: 'Maharashtra' },
  { region: 'Sangli', aqi: 108, pm25: 54, pm10: 87, no2: 27, so2: 9, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 16.8524, lng: 74.5815, state: 'Maharashtra' },
  { region: 'Kolhapur', aqi: 102, pm25: 51, pm10: 82, no2: 25, so2: 8, co: 1.0, o3: 45, status: 'Moderate', trend: 'stable', lat: 16.705, lng: 74.2433, state: 'Maharashtra' },
  { region: 'Ratnagiri', aqi: 62, pm25: 24, pm10: 41, no2: 11, so2: 3, co: 0.5, o3: 36, status: 'Satisfactory', trend: 'down', lat: 16.9902, lng: 73.3120, state: 'Maharashtra' },
  { region: 'Sindhudurg', aqi: 48, pm25: 17, pm10: 30, no2: 8, so2: 2, co: 0.4, o3: 33, status: 'Good', trend: 'stable', lat: 16.3490, lng: 73.8554, state: 'Maharashtra' },
  { region: 'Raigad', aqi: 88, pm25: 41, pm10: 67, no2: 20, so2: 6, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 18.5158, lng: 73.1855, state: 'Maharashtra' },
  { region: 'Alibag', aqi: 78, pm25: 33, pm10: 56, no2: 15, so2: 4, co: 0.7, o3: 39, status: 'Satisfactory', trend: 'stable', lat: 18.6414, lng: 72.8722, state: 'Maharashtra' },
  { region: 'Pen (Raigad)', aqi: 84, pm25: 38, pm10: 63, no2: 18, so2: 5, co: 0.8, o3: 41, status: 'Satisfactory', trend: 'stable', lat: 18.7396, lng: 73.0922, state: 'Maharashtra' },
  { region: 'Panvel', aqi: 118, pm25: 60, pm10: 96, no2: 30, so2: 10, co: 1.3, o3: 48, status: 'Moderate', trend: 'up', lat: 18.9894, lng: 73.1175, state: 'Maharashtra' },
  { region: 'Roha', aqi: 92, pm25: 44, pm10: 71, no2: 21, so2: 7, co: 0.9, o3: 43, status: 'Satisfactory', trend: 'stable', lat: 18.4399, lng: 73.1153, state: 'Maharashtra' },
  { region: 'Mahad', aqi: 86, pm25: 39, pm10: 65, no2: 18, so2: 6, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 18.0824, lng: 73.4084, state: 'Maharashtra' },
  { region: 'Chiplun', aqi: 68, pm25: 27, pm10: 47, no2: 13, so2: 4, co: 0.6, o3: 37, status: 'Satisfactory', trend: 'stable', lat: 17.5309, lng: 73.5140, state: 'Maharashtra' },
  { region: 'Kankavli', aqi: 52, pm25: 19, pm10: 33, no2: 9, so2: 2, co: 0.4, o3: 34, status: 'Good', trend: 'stable', lat: 16.2478, lng: 73.7002, state: 'Maharashtra' },
  { region: 'Vengurla', aqi: 44, pm25: 15, pm10: 27, no2: 7, so2: 2, co: 0.3, o3: 32, status: 'Good', trend: 'stable', lat: 15.8645, lng: 73.6392, state: 'Maharashtra' },
  { region: 'Dapoli', aqi: 58, pm25: 22, pm10: 38, no2: 10, so2: 3, co: 0.5, o3: 35, status: 'Satisfactory', trend: 'stable', lat: 17.7617, lng: 73.1872, state: 'Maharashtra' },
  { region: 'Guhagar', aqi: 46, pm25: 16, pm10: 28, no2: 8, so2: 2, co: 0.3, o3: 32, status: 'Good', trend: 'stable', lat: 17.4904, lng: 73.2002, state: 'Maharashtra' },
  // Pune Division
  { region: 'Baramati', aqi: 114, pm25: 57, pm10: 92, no2: 28, so2: 9, co: 1.2, o3: 47, status: 'Moderate', trend: 'stable', lat: 18.1516, lng: 74.5804, state: 'Maharashtra' },
  { region: 'Shirur', aqi: 106, pm25: 53, pm10: 85, no2: 26, so2: 8, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 18.8274, lng: 74.3757, state: 'Maharashtra' },
  { region: 'Maval', aqi: 98, pm25: 48, pm10: 78, no2: 23, so2: 7, co: 1.0, o3: 44, status: 'Satisfactory', trend: 'stable', lat: 18.7605, lng: 73.6502, state: 'Maharashtra' },
  { region: 'Wai', aqi: 88, pm25: 41, pm10: 67, no2: 20, so2: 6, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 17.9536, lng: 73.8952, state: 'Maharashtra' },
  { region: 'Panchgani', aqi: 54, pm25: 20, pm10: 35, no2: 9, so2: 2, co: 0.4, o3: 34, status: 'Good', trend: 'stable', lat: 17.9244, lng: 73.8066, state: 'Maharashtra' },
  { region: 'Mahabaleshwar', aqi: 38, pm25: 12, pm10: 22, no2: 6, so2: 2, co: 0.3, o3: 31, status: 'Good', trend: 'down', lat: 17.9237, lng: 73.6572, state: 'Maharashtra' },
  { region: 'Lonawala', aqi: 86, pm25: 39, pm10: 64, no2: 18, so2: 5, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 18.7481, lng: 73.4072, state: 'Maharashtra' },
  { region: 'Khandala', aqi: 84, pm25: 38, pm10: 62, no2: 17, so2: 5, co: 0.7, o3: 41, status: 'Satisfactory', trend: 'stable', lat: 18.7593, lng: 73.3789, state: 'Maharashtra' },
  { region: 'Talegaon Dabhade', aqi: 108, pm25: 54, pm10: 87, no2: 27, so2: 8, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 18.7310, lng: 73.6705, state: 'Maharashtra' },
  { region: 'Jejuri', aqi: 102, pm25: 51, pm10: 82, no2: 25, so2: 8, co: 1.0, o3: 45, status: 'Moderate', trend: 'stable', lat: 18.2697, lng: 74.1553, state: 'Maharashtra' },
  { region: 'Indapur', aqi: 96, pm25: 46, pm10: 75, no2: 22, so2: 7, co: 0.9, o3: 44, status: 'Satisfactory', trend: 'stable', lat: 18.0098, lng: 75.0253, state: 'Maharashtra' },
  // Nashik Division
  { region: 'Igatpuri', aqi: 72, pm25: 30, pm10: 52, no2: 13, so2: 4, co: 0.6, o3: 38, status: 'Satisfactory', trend: 'down', lat: 19.6928, lng: 73.5497, state: 'Maharashtra' },
  { region: 'Sinnar', aqi: 116, pm25: 58, pm10: 94, no2: 29, so2: 10, co: 1.2, o3: 47, status: 'Moderate', trend: 'stable', lat: 19.8421, lng: 74.0024, state: 'Maharashtra' },
  { region: 'Malegaon', aqi: 134, pm25: 69, pm10: 110, no2: 35, so2: 12, co: 1.5, o3: 50, status: 'Moderate', trend: 'up', lat: 20.5579, lng: 74.5089, state: 'Maharashtra' },
  { region: 'Yeola', aqi: 112, pm25: 56, pm10: 90, no2: 27, so2: 9, co: 1.2, o3: 46, status: 'Moderate', trend: 'stable', lat: 20.0432, lng: 74.4880, state: 'Maharashtra' },
  { region: 'Niphad', aqi: 108, pm25: 54, pm10: 87, no2: 26, so2: 8, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 20.0801, lng: 74.1018, state: 'Maharashtra' },
  { region: 'Dindori', aqi: 94, pm25: 45, pm10: 73, no2: 22, so2: 7, co: 0.9, o3: 43, status: 'Satisfactory', trend: 'stable', lat: 20.2028, lng: 73.8299, state: 'Maharashtra' },
  { region: 'Trimbakeshwar', aqi: 66, pm25: 26, pm10: 45, no2: 12, so2: 3, co: 0.6, o3: 37, status: 'Satisfactory', trend: 'down', lat: 19.9397, lng: 73.5298, state: 'Maharashtra' },
  { region: 'Dhule', aqi: 126, pm25: 64, pm10: 102, no2: 32, so2: 10, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 20.9042, lng: 74.7749, state: 'Maharashtra' },
  { region: 'Jalgaon', aqi: 132, pm25: 67, pm10: 107, no2: 34, so2: 11, co: 1.5, o3: 50, status: 'Moderate', trend: 'stable', lat: 21.0077, lng: 75.5626, state: 'Maharashtra' },
  { region: 'Amalner', aqi: 118, pm25: 60, pm10: 96, no2: 30, so2: 9, co: 1.3, o3: 47, status: 'Moderate', trend: 'stable', lat: 21.0487, lng: 75.0601, state: 'Maharashtra' },
  { region: 'Pachora', aqi: 112, pm25: 56, pm10: 91, no2: 28, so2: 9, co: 1.2, o3: 46, status: 'Moderate', trend: 'stable', lat: 20.6593, lng: 75.3434, state: 'Maharashtra' },
  { region: 'Nandurbar', aqi: 108, pm25: 54, pm10: 87, no2: 27, so2: 8, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 21.3706, lng: 74.2406, state: 'Maharashtra' },
  { region: 'Shahada', aqi: 104, pm25: 52, pm10: 84, no2: 26, so2: 8, co: 1.1, o3: 45, status: 'Moderate', trend: 'stable', lat: 21.5431, lng: 74.4705, state: 'Maharashtra' },
  { region: 'Akola', aqi: 138, pm25: 71, pm10: 114, no2: 36, so2: 12, co: 1.6, o3: 51, status: 'Moderate', trend: 'up', lat: 20.7002, lng: 77.0082, state: 'Maharashtra' },
  { region: 'Amravati', aqi: 128, pm25: 65, pm10: 104, no2: 33, so2: 11, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 20.9374, lng: 77.7796, state: 'Maharashtra' },
  // Aurangabad / Marathwada Division
  { region: 'Jalna', aqi: 120, pm25: 61, pm10: 98, no2: 30, so2: 10, co: 1.3, o3: 48, status: 'Moderate', trend: 'stable', lat: 19.8347, lng: 75.8816, state: 'Maharashtra' },
  { region: 'Beed', aqi: 116, pm25: 58, pm10: 93, no2: 29, so2: 9, co: 1.2, o3: 47, status: 'Moderate', trend: 'stable', lat: 18.9890, lng: 75.7601, state: 'Maharashtra' },
  { region: 'Osmanabad', aqi: 104, pm25: 52, pm10: 84, no2: 26, so2: 8, co: 1.1, o3: 45, status: 'Moderate', trend: 'stable', lat: 18.1861, lng: 76.0404, state: 'Maharashtra' },
  { region: 'Parbhani', aqi: 122, pm25: 62, pm10: 100, no2: 31, so2: 10, co: 1.3, o3: 48, status: 'Moderate', trend: 'stable', lat: 19.2705, lng: 76.7760, state: 'Maharashtra' },
  { region: 'Hingoli', aqi: 114, pm25: 57, pm10: 92, no2: 28, so2: 9, co: 1.2, o3: 47, status: 'Moderate', trend: 'stable', lat: 19.7177, lng: 77.1498, state: 'Maharashtra' },
  { region: 'Ambejogai', aqi: 108, pm25: 54, pm10: 87, no2: 27, so2: 8, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 18.7321, lng: 76.3888, state: 'Maharashtra' },
  { region: 'Solapur', aqi: 118, pm25: 59, pm10: 95, no2: 29, so2: 9, co: 1.3, o3: 47, status: 'Moderate', trend: 'stable', lat: 17.6599, lng: 75.9064, state: 'Maharashtra' },
  { region: 'Pandharpur', aqi: 96, pm25: 46, pm10: 75, no2: 23, so2: 7, co: 0.9, o3: 44, status: 'Satisfactory', trend: 'stable', lat: 17.6836, lng: 75.3258, state: 'Maharashtra' },
  { region: 'Mangalvedhe', aqi: 88, pm25: 41, pm10: 67, no2: 20, so2: 6, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 17.5238, lng: 75.4538, state: 'Maharashtra' },
  { region: 'Barshi', aqi: 102, pm25: 51, pm10: 82, no2: 25, so2: 8, co: 1.0, o3: 45, status: 'Moderate', trend: 'stable', lat: 18.2357, lng: 75.6952, state: 'Maharashtra' },
  // Nagpur Division
  { region: 'Wardha', aqi: 126, pm25: 64, pm10: 102, no2: 32, so2: 10, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 20.7453, lng: 78.6022, state: 'Maharashtra' },
  { region: 'Yavatmal', aqi: 122, pm25: 62, pm10: 100, no2: 31, so2: 10, co: 1.3, o3: 48, status: 'Moderate', trend: 'stable', lat: 20.3888, lng: 78.1204, state: 'Maharashtra' },
  { region: 'Chandrapur', aqi: 148, pm25: 79, pm10: 124, no2: 40, so2: 14, co: 1.8, o3: 53, status: 'Moderate', trend: 'up', lat: 19.9615, lng: 79.2961, state: 'Maharashtra' },
  { region: 'Gadchiroli', aqi: 72, pm25: 30, pm10: 52, no2: 14, so2: 4, co: 0.6, o3: 38, status: 'Satisfactory', trend: 'stable', lat: 20.1803, lng: 79.9944, state: 'Maharashtra' },
  { region: 'Gondia', aqi: 88, pm25: 41, pm10: 67, no2: 20, so2: 6, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 21.4626, lng: 80.1946, state: 'Maharashtra' },
  { region: 'Bhandara', aqi: 94, pm25: 45, pm10: 73, no2: 22, so2: 7, co: 0.9, o3: 43, status: 'Satisfactory', trend: 'stable', lat: 21.1659, lng: 79.6512, state: 'Maharashtra' },
  { region: 'Butibori', aqi: 142, pm25: 73, pm10: 117, no2: 37, so2: 13, co: 1.7, o3: 52, status: 'Moderate', trend: 'up', lat: 20.9560, lng: 79.0895, state: 'Maharashtra' },
  { region: 'Kamptee', aqi: 136, pm25: 70, pm10: 112, no2: 35, so2: 12, co: 1.6, o3: 51, status: 'Moderate', trend: 'stable', lat: 21.2216, lng: 79.1932, state: 'Maharashtra' },
  { region: 'Katol', aqi: 106, pm25: 53, pm10: 85, no2: 26, so2: 8, co: 1.1, o3: 46, status: 'Moderate', trend: 'stable', lat: 21.2726, lng: 78.5871, state: 'Maharashtra' },
  { region: 'Umred', aqi: 112, pm25: 56, pm10: 90, no2: 28, so2: 9, co: 1.2, o3: 46, status: 'Moderate', trend: 'stable', lat: 20.8548, lng: 79.3261, state: 'Maharashtra' },
  // Mumbai Metro Region
  { region: 'Thane', aqi: 138, pm25: 71, pm10: 114, no2: 36, so2: 12, co: 1.6, o3: 51, status: 'Moderate', trend: 'up', lat: 19.2183, lng: 72.9781, state: 'Maharashtra' },
  { region: 'Navi Mumbai', aqi: 128, pm25: 65, pm10: 104, no2: 33, so2: 11, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 19.0330, lng: 73.0297, state: 'Maharashtra' },
  { region: 'Kalyan', aqi: 142, pm25: 74, pm10: 118, no2: 38, so2: 13, co: 1.7, o3: 52, status: 'Moderate', trend: 'up', lat: 19.2403, lng: 73.1305, state: 'Maharashtra' },
  { region: 'Dombivli', aqi: 144, pm25: 75, pm10: 120, no2: 38, so2: 13, co: 1.7, o3: 52, status: 'Moderate', trend: 'up', lat: 19.2094, lng: 73.0878, state: 'Maharashtra' },
  { region: 'Bhiwandi', aqi: 152, pm25: 81, pm10: 128, no2: 41, so2: 14, co: 1.9, o3: 53, status: 'Moderate', trend: 'up', lat: 19.2967, lng: 73.0586, state: 'Maharashtra' },
  { region: 'Mira-Bhayandar', aqi: 136, pm25: 70, pm10: 112, no2: 36, so2: 12, co: 1.6, o3: 51, status: 'Moderate', trend: 'stable', lat: 19.2952, lng: 72.8544, state: 'Maharashtra' },
  { region: 'Vasai-Virar', aqi: 128, pm25: 65, pm10: 104, no2: 33, so2: 11, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 19.4071, lng: 72.8397, state: 'Maharashtra' },
  { region: 'Badlapur', aqi: 122, pm25: 62, pm10: 100, no2: 31, so2: 10, co: 1.3, o3: 48, status: 'Moderate', trend: 'stable', lat: 19.1518, lng: 73.2606, state: 'Maharashtra' },
  { region: 'Ambarnath', aqi: 132, pm25: 68, pm10: 108, no2: 35, so2: 12, co: 1.5, o3: 50, status: 'Moderate', trend: 'up', lat: 19.1975, lng: 73.1986, state: 'Maharashtra' },
  { region: 'Ulhasnagar', aqi: 148, pm25: 79, pm10: 124, no2: 40, so2: 14, co: 1.8, o3: 53, status: 'Moderate', trend: 'up', lat: 19.2215, lng: 73.1478, state: 'Maharashtra' },
  // Small villages / gram panchayats
  { region: 'Shirdi', aqi: 94, pm25: 45, pm10: 73, no2: 22, so2: 7, co: 0.9, o3: 43, status: 'Satisfactory', trend: 'stable', lat: 19.7684, lng: 74.4770, state: 'Maharashtra' },
  { region: 'Shegaon', aqi: 102, pm25: 51, pm10: 82, no2: 25, so2: 8, co: 1.0, o3: 45, status: 'Moderate', trend: 'stable', lat: 20.7942, lng: 76.6985, state: 'Maharashtra' },
  { region: 'Dehu', aqi: 112, pm25: 56, pm10: 90, no2: 28, so2: 9, co: 1.2, o3: 46, status: 'Moderate', trend: 'stable', lat: 18.7172, lng: 73.7536, state: 'Maharashtra' },
  { region: 'Alandi', aqi: 116, pm25: 58, pm10: 93, no2: 29, so2: 9, co: 1.2, o3: 47, status: 'Moderate', trend: 'stable', lat: 18.6681, lng: 73.9022, state: 'Maharashtra' },
  { region: 'Morshi', aqi: 104, pm25: 52, pm10: 84, no2: 26, so2: 8, co: 1.1, o3: 45, status: 'Moderate', trend: 'stable', lat: 21.3222, lng: 78.0094, state: 'Maharashtra' },
  { region: 'Karjat (MH)', aqi: 82, pm25: 37, pm10: 61, no2: 17, so2: 5, co: 0.7, o3: 40, status: 'Satisfactory', trend: 'down', lat: 18.9105, lng: 73.3165, state: 'Maharashtra' },
  { region: 'Khopoli', aqi: 96, pm25: 46, pm10: 75, no2: 23, so2: 7, co: 0.9, o3: 44, status: 'Satisfactory', trend: 'stable', lat: 18.7860, lng: 73.3374, state: 'Maharashtra' },
  { region: 'Wadala', aqi: 148, pm25: 79, pm10: 124, no2: 40, so2: 14, co: 1.8, o3: 53, status: 'Moderate', trend: 'up', lat: 19.0143, lng: 72.8588, state: 'Maharashtra' },
  { region: 'Mankhurd', aqi: 158, pm25: 84, pm10: 132, no2: 43, so2: 15, co: 1.9, o3: 54, status: 'Moderate', trend: 'up', lat: 19.0476, lng: 72.9268, state: 'Maharashtra' },
  { region: 'Mulund', aqi: 134, pm25: 68, pm10: 109, no2: 35, so2: 12, co: 1.5, o3: 50, status: 'Moderate', trend: 'stable', lat: 19.1726, lng: 72.9567, state: 'Maharashtra' },
  { region: 'Borivali', aqi: 126, pm25: 64, pm10: 102, no2: 32, so2: 11, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 19.2307, lng: 72.8567, state: 'Maharashtra' },
  { region: 'Kandivali', aqi: 128, pm25: 65, pm10: 104, no2: 33, so2: 11, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 19.2094, lng: 72.8520, state: 'Maharashtra' },
  { region: 'Malad', aqi: 132, pm25: 67, pm10: 107, no2: 34, so2: 11, co: 1.5, o3: 50, status: 'Moderate', trend: 'stable', lat: 19.1874, lng: 72.8479, state: 'Maharashtra' },
  { region: 'Andheri', aqi: 144, pm25: 75, pm10: 120, no2: 38, so2: 13, co: 1.7, o3: 52, status: 'Moderate', trend: 'up', lat: 19.1136, lng: 72.8697, state: 'Maharashtra' },
  { region: 'Kurla', aqi: 152, pm25: 81, pm10: 128, no2: 41, so2: 14, co: 1.9, o3: 53, status: 'Moderate', trend: 'up', lat: 19.0710, lng: 72.8794, state: 'Maharashtra' },
  { region: 'Chembur', aqi: 156, pm25: 83, pm10: 130, no2: 42, so2: 15, co: 1.9, o3: 54, status: 'Moderate', trend: 'up', lat: 19.0619, lng: 72.9003, state: 'Maharashtra' },
  { region: 'Ghatkopar', aqi: 148, pm25: 79, pm10: 124, no2: 40, so2: 14, co: 1.8, o3: 53, status: 'Moderate', trend: 'up', lat: 19.0858, lng: 72.9081, state: 'Maharashtra' },
  { region: 'Vikhroli', aqi: 142, pm25: 73, pm10: 117, no2: 37, so2: 13, co: 1.7, o3: 52, status: 'Moderate', trend: 'up', lat: 19.1071, lng: 72.9268, state: 'Maharashtra' },
  { region: 'Kanjurmarg', aqi: 138, pm25: 71, pm10: 114, no2: 36, so2: 12, co: 1.6, o3: 51, status: 'Moderate', trend: 'stable', lat: 19.1302, lng: 72.9388, state: 'Maharashtra' },
  { region: 'Powai', aqi: 122, pm25: 62, pm10: 100, no2: 31, so2: 10, co: 1.3, o3: 48, status: 'Moderate', trend: 'stable', lat: 19.1197, lng: 72.9060, state: 'Maharashtra' },
  { region: 'Versova', aqi: 118, pm25: 59, pm10: 95, no2: 29, so2: 9, co: 1.3, o3: 47, status: 'Moderate', trend: 'stable', lat: 19.1390, lng: 72.8183, state: 'Maharashtra' },
  { region: 'Goregaon', aqi: 126, pm25: 64, pm10: 102, no2: 32, so2: 11, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 19.1663, lng: 72.8526, state: 'Maharashtra' },
  { region: 'Dahisar', aqi: 124, pm25: 63, pm10: 101, no2: 32, so2: 10, co: 1.4, o3: 49, status: 'Moderate', trend: 'stable', lat: 19.2522, lng: 72.8542, state: 'Maharashtra' },
  { region: 'Manpada', aqi: 136, pm25: 70, pm10: 112, no2: 35, so2: 12, co: 1.6, o3: 51, status: 'Moderate', trend: 'stable', lat: 19.1831, lng: 73.0148, state: 'Maharashtra' },
  { region: 'Titwala', aqi: 118, pm25: 59, pm10: 95, no2: 29, so2: 9, co: 1.3, o3: 47, status: 'Moderate', trend: 'stable', lat: 19.2999, lng: 73.2062, state: 'Maharashtra' },
  { region: 'Shahpur (MH)', aqi: 92, pm25: 43, pm10: 70, no2: 21, so2: 6, co: 0.9, o3: 43, status: 'Satisfactory', trend: 'stable', lat: 19.6000, lng: 73.3500, state: 'Maharashtra' },
  { region: 'Wada', aqi: 88, pm25: 40, pm10: 66, no2: 19, so2: 6, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 19.6566, lng: 73.2063, state: 'Maharashtra' },
  { region: 'Murbad', aqi: 84, pm25: 38, pm10: 63, no2: 18, so2: 5, co: 0.8, o3: 41, status: 'Satisfactory', trend: 'stable', lat: 19.2541, lng: 73.3940, state: 'Maharashtra' },
  { region: 'Khalapur', aqi: 96, pm25: 46, pm10: 75, no2: 22, so2: 7, co: 0.9, o3: 44, status: 'Satisfactory', trend: 'stable', lat: 18.8425, lng: 73.2695, state: 'Maharashtra' },
  { region: 'Uran', aqi: 104, pm25: 52, pm10: 84, no2: 26, so2: 8, co: 1.1, o3: 45, status: 'Moderate', trend: 'up', lat: 18.8898, lng: 72.9495, state: 'Maharashtra' },
  { region: 'Palghar (Town)', aqi: 118, pm25: 59, pm10: 95, no2: 29, so2: 9, co: 1.3, o3: 47, status: 'Moderate', trend: 'stable', lat: 19.6967, lng: 72.7659, state: 'Maharashtra' },
  { region: 'Talasari', aqi: 72, pm25: 30, pm10: 52, no2: 13, so2: 4, co: 0.6, o3: 38, status: 'Satisfactory', trend: 'stable', lat: 20.0000, lng: 72.8000, state: 'Maharashtra' },
  { region: 'Dahanu', aqi: 86, pm25: 39, pm10: 64, no2: 19, so2: 6, co: 0.8, o3: 42, status: 'Satisfactory', trend: 'stable', lat: 19.9674, lng: 72.7139, state: 'Maharashtra' },
  { region: 'Jawhar', aqi: 62, pm25: 24, pm10: 41, no2: 11, so2: 3, co: 0.5, o3: 36, status: 'Satisfactory', trend: 'down', lat: 19.9056, lng: 73.2260, state: 'Maharashtra' },
  { region: 'Vikramgad', aqi: 58, pm25: 22, pm10: 38, no2: 10, so2: 3, co: 0.5, o3: 35, status: 'Satisfactory', trend: 'stable', lat: 19.8263, lng: 73.0626, state: 'Maharashtra' },
  { region: 'Yeoor', aqi: 68, pm25: 27, pm10: 47, no2: 13, so2: 4, co: 0.6, o3: 37, status: 'Satisfactory', trend: 'stable', lat: 19.2545, lng: 73.0142, state: 'Maharashtra' },
  { region: 'Amboli (Sindhudurg)', aqi: 38, pm25: 12, pm10: 22, no2: 6, so2: 2, co: 0.3, o3: 31, status: 'Good', trend: 'down', lat: 15.9598, lng: 73.9925, state: 'Maharashtra' },
];

// ── Build pollutant readings from a RegionalAQI entry ───────────────────────
function buildReadings(loc: RegionalAQI): PollutantReading[] {
  const aqiCat = getAQICategory(loc.aqi) as AQICategory;
  const pm25Cat = getAQICategory(loc.pm25 * 2.1) as AQICategory;
  const pm10Cat = getAQICategory((loc.pm10 ?? 0) * 1.5) as AQICategory;
  const no2Cat  = getAQICategory((loc.no2 ?? 0) * 3.2) as AQICategory;
  const coVal   = loc.co ?? 1.0;
  const o3Val   = loc.o3 ?? 45;
  const so2Val  = loc.so2 ?? 10;

  return [
    { id: 'pol-pm25', name: 'Fine Particulate Matter',  shortName: 'PM₂.₅', value: loc.pm25, unit: 'µg/m³', category: pm25Cat, description: 'Particles ≤2.5 µm diameter. Primary health indicator.' },
    { id: 'pol-pm10', name: 'Coarse Particulate Matter', shortName: 'PM₁₀',  value: loc.pm10 ?? 0, unit: 'µg/m³', category: pm10Cat, description: 'Particles ≤10 µm diameter. Respiratory health concern.' },
    { id: 'pol-no2',  name: 'Nitrogen Dioxide',          shortName: 'NO₂',   value: loc.no2 ?? 0,  unit: 'ppb',    category: no2Cat,  description: 'Primarily from combustion emissions and traffic.' },
    { id: 'pol-co',   name: 'Carbon Monoxide',            shortName: 'CO',    value: coVal,    unit: 'mg/m³',  category: getAQICategory(coVal * 30) as AQICategory, description: 'Produced by incomplete combustion.' },
    { id: 'pol-o3',   name: 'Ground-level Ozone',         shortName: 'O₃',    value: o3Val,    unit: 'µg/m³',  category: getAQICategory(o3Val * 1.8) as AQICategory, description: 'Secondary pollutant formed from NOx and VOC reactions.' },
    { id: 'pol-so2',  name: 'Sulphur Dioxide',            shortName: 'SO₂',   value: so2Val,   unit: 'ppb',    category: aqiCat,  description: 'From industrial processes and fossil fuel combustion.' },
  ];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '11px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '6px', color: '#1e293b' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: 'flex', gap: '6px', marginBottom: '3px', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
            <span style={{ color: '#64748b' }}>{p.name}:</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Fuzzy search helper ──────────────────────────────────────────────────────
function searchLocations(query: string): RegionalAQI[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return LOCATION_DATABASE.filter(
    (loc) =>
      loc.region.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q)
  ).slice(0, 8);
}

const AirQuality: React.FC = () => {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>(defaultMapLayers);
  const [selectedTime, setSelectedTime] = useState('14:00');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<RegionalAQI[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<RegionalAQI | null>(
    LOCATION_DATABASE.find((l) => l.region === 'Mumbai') ?? null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLayerToggle = (id: string) => {
    setMapLayers((layers) =>
      layers.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const results = searchLocations(val);
    setSuggestions(results);
    setShowDropdown(results.length > 0);
  };

  const handleSelect = (loc: RegionalAQI) => {
    setSelectedLocation(loc);
    setSearchQuery(loc.region);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayReadings = selectedLocation
    ? buildReadings(selectedLocation)
    : pollutantReadings;

  const aqiColor = selectedLocation
    ? getCategoryColor(selectedLocation.status)
    : '#eab308';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 20px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Wind size={16} color="#2563eb" />
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Surface Air Quality
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Estimated surface-level pollutant concentrations — India
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* 🔍 Location search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  padding: '4px 10px',
                  width: '230px',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={() => {
                  (document.getElementById('loc-search-wrap') as any)?.style;
                }}
              >
                <Search size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  id="location-search-input"
                  type="text"
                  placeholder="Search city or village…"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '11px',
                    color: '#1e293b',
                    width: '100%',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={handleClear}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: 1 }}
                    title="Clear"
                  >
                    <X size={12} color="#94a3b8" />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  {suggestions.map((loc) => (
                    <button
                      key={loc.region}
                      onClick={() => handleSelect(loc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        gap: '8px',
                        padding: '9px 12px',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid #f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <MapPin size={11} color="#94a3b8" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>{loc.region}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{loc.state}</div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: getCategoryColor(loc.status),
                          background: `${getCategoryColor(loc.status)}18`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          flexShrink: 0,
                        }}
                      >
                        AQI {loc.aqi}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time selector */}
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                borderRadius: '4px',
                fontSize: '11px',
                padding: '4px 8px',
                color: '#1e293b',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {hourlyData.map((h) => (
                <option key={h.hour} value={h.hour}>{h.hour} IST</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main: map + right panel */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          overflow: 'hidden',
        }}
      >
        {/* Map */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            layers={mapLayers}
            onLayerToggle={handleLayerToggle}
            mode="air-quality"
            selectedLocation={selectedLocation}
          />
        </div>

        {/* Right panel */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            overflowY: 'auto',
            background: '#ffffff',
          }}
        >
          {/* Pollutant readings */}
          <div style={{ padding: '14px 14px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart2 size={13} color="#64748b" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                  Pollutant Concentrations
                  {selectedLocation ? ` — ${selectedLocation.region}` : ''}
                </span>
              </div>
              {selectedLocation && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: `${aqiColor}18`,
                    border: `1px solid ${aqiColor}40`,
                    borderRadius: '6px',
                    padding: '3px 8px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: '800', color: aqiColor }}>
                    AQI {selectedLocation.aqi}
                  </span>
                  <span style={{ fontSize: '10px', color: aqiColor, opacity: 0.8 }}>
                    · {selectedLocation.status}
                  </span>
                </div>
              )}
            </div>

            {/* State tag */}
            {selectedLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                <MapPin size={10} color="#94a3b8" />
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {selectedLocation.state}
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {displayReadings.map((p) => (
                <PollutantCard key={p.id} pollutant={p} compact />
              ))}
            </div>
          </div>

          {/* 24-hour trend */}
          <div
            style={{
              padding: '0 14px 14px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 0 10px',
              }}
            >
              <TrendingUp size={13} color="#64748b" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                24-Hour Trend — National Average
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={hourlyData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="aqi" name="AQI" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pm25" name="PM₂.₅" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="pm10" name="PM₁₀" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* City breakdown */}
          <div
            style={{
              borderTop: '1px solid #f1f5f9',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="#64748b" />
              Current AQI — Top Cities
            </div>
            {regionalAQI.slice(0, 6).map((city) => (
              <button
                key={city.region}
                onClick={() => handleSelect(city)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 6px',
                  borderBottom: '1px solid #f8fafc',
                  gap: '8px',
                  width: '100%',
                  background: selectedLocation?.region === city.region ? '#f0f7ff' : 'none',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (selectedLocation?.region !== city.region)
                    e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (selectedLocation?.region !== city.region)
                    e.currentTarget.style.background = 'none';
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#334155', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {city.region}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', minWidth: '36px', textAlign: 'right' }}>
                  {city.aqi}
                </span>
                <StatusBadge status={city.status} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
