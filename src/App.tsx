import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Overview from './pages/Overview';
import AirQuality from './pages/AirQuality';
import HchoHotspots from './pages/HchoHotspots';
import FireActivity from './pages/FireActivity';
import PollutionTransport from './pages/PollutionTransport';
import DataSources from './pages/DataSources';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="air-quality" element={<AirQuality />} />
          <Route path="hcho-hotspots" element={<HchoHotspots />} />
          <Route path="fire-activity" element={<FireActivity />} />
          <Route path="pollution-transport" element={<PollutionTransport />} />
          <Route path="data-sources" element={<DataSources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
