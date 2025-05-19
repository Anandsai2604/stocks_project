import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./stocks.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StocksDashboard() {
  const [news, setNews] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [candleData, setCandleData] = useState(null);
  const [stockSymbol, setStockSymbol] = useState("AAPL");
  const [stockName, setStockName] = useState("Apple Inc.");
  const [input, setInput] = useState("AAPL");
  const [loading, setLoading] = useState(false);

  const currentPrice =
    candleData && candleData.c ? candleData.c[candleData.c.length - 1] : null;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news?symbol=${stockSymbol}`)
      .then((res) => res.json())
      .then(setNews)
      .catch(() => setNews([]));

    fetch(`/api/prediction?symbol=${stockSymbol}`)
      .then((res) => res.json())
      .then((data) => setPrediction(data.prediction))
      .catch(() => setPrediction(null));

    fetch(`/api/candles?symbol=${stockSymbol}`)
      .then((res) => res.json())
      .then(setCandleData)
      .catch(() => setCandleData(null));

    // Optionally fetch company name from your backend or a static map
    // Here, just set the symbol as name if not AAPL
    setStockName(stockSymbol === "AAPL" ? "Apple Inc." : stockSymbol);

    setLoading(false);
  }, [stockSymbol]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setStockSymbol(input.trim().toUpperCase());
    }
  };

  return (
    <div className="dashboard">
      <form className="searchBar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search stock symbol (e.g. AAPL, TSLA, RELIANCE.NS)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="stockHeader">
        <div>
          <div className="stockName">{stockName}</div>
          <div className="stockSymbol">{stockSymbol}</div>
        </div>
        <div className="stockPrice">
          {currentPrice !== null ? `$${currentPrice.toFixed(2)}` : "--"}
        </div>
      </div>

      <div className="sections">
        <section className="section">
          <h3>Latest News</h3>
          {news.length === 0 && <div>No news found.</div>}
          <ul>
            {news.slice(0, 5).map((item) => (
              <li key={item.id || item.datetime}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.headline}
                </a>
                <div className="newsTime">
                  {item.datetime
                    ? new Date(item.datetime * 1000).toLocaleString()
                    : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <h3>AI Prediction</h3>
          <div className="predictionBox">
            <span>
              {prediction !== null ? `$${prediction}` : "N/A"}
            </span>
            <div className="predictionLabel">Next Close</div>
          </div>
        </section>

        <section className="section">
          <h3>Price Chart (30D)</h3>
          {candleData && candleData.t && candleData.c ? (
            <Line
              data={{
                labels: candleData.t.map((ts) =>
                  new Date(ts * 1000).toLocaleDateString()
                ),
                datasets: [
                  {
                    label: "Close Price",
                    data: candleData.c,
                    borderColor: "#1976d2",
                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  x: { display: false },
                  y: { beginAtZero: false },
                },
              }}
            />
          ) : (
            <div>Loading chart...</div>
          )}
        </section>
      </div>
    </div>
  );
}