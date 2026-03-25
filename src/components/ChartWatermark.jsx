export default function ChartWatermark() {
  return (
    <div className="chart-watermark">
      <img
        src={import.meta.env.BASE_URL + 'analytica-logo.png'}
        alt="Analytica DSS"
      />
    </div>
  );
}
