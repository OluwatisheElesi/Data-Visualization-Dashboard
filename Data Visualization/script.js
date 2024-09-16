// Set dimensions and margins for the horizontal bar chart
const margin = { top: 60, right: 30, bottom: 60, left: 150 }; // Increased left margin for job titles
const width = 900 - margin.left - margin.right;
const heightSalaryChart = 400 - margin.top - margin.bottom;

// Select salary chart SVG
const salarySvg = d3.select("#salaryChart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", heightSalaryChart + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data from CSV
d3.csv("datasheet.csv").then(data => {
  
  // Convert necessary fields to numbers
  data.forEach(d => {
    d.salary_in_usd = +d.salary_in_usd; // Convert salary to a number
  });

  // Horizontal bar chart setup
  const xSalary = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.salary_in_usd)])
    .range([0, width]);

  const ySalary = d3.scaleBand()
    .domain(data.map(d => d.job_title))
    .range([0, heightSalaryChart])
    .padding(0.1);

  // Add X-axis (Salary)
  salarySvg.append("g")
    .attr("transform", `translate(0, ${heightSalaryChart})`)
    .call(d3.axisBottom(xSalary).ticks(5).tickFormat(d => `$${d / 1000}k`));

  // Add Y-axis (Job Titles)
  salarySvg.append("g")
    .call(d3.axisLeft(ySalary));

  // Color scale for bars
  const colorScaleSalary = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.salary_in_usd)])
    .range(["#87CEEB", "#1E90FF"]);

  // Add horizontal bars with hover effect
  salarySvg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", d => ySalary(d.job_title))
    .attr("x", 0)
    .attr("width", d => xSalary(d.salary_in_usd))
    .attr("height", ySalary.bandwidth())
    .attr("fill", d => colorScaleSalary(d.salary_in_usd))
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", "orange")
        .attr("width", d => xSalary(d.salary_in_usd) + 10); // Expand bar on hover
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", d => colorScaleSalary(d.salary_in_usd))
        .attr("width", d => xSalary(d.salary_in_usd)); // Revert size
    });

  // X-axis label (Salary)
  salarySvg.append("text")
    .attr("x", width / 2)
    .attr("y", heightSalaryChart + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .text("Salary (USD)");

  // Y-axis label (Job Titles)
  salarySvg.append("text")
    .attr("x", -heightSalaryChart / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Job Title");

  // Chart title
  salarySvg.append("text")
    .attr("x", width / 2)
    .attr("y", -30) // Position title 30px above the chart
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Salary Comparison and Remote Work Trends for Various Data Jobs");
});
