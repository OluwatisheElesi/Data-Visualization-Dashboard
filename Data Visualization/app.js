// Set dimensions and margins for the bubble chart
const margin = { top: 60, right: 30, bottom: 100, left: 100 }; // Increased bottom margin for more space below
const width = 900 - margin.left - margin.right;
const heightBubbleChart = 500 - margin.top - margin.bottom;

// Select bubble chart SVG
const bubbleSvg = d3.select("#bubbleChart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", heightBubbleChart + margin.top + margin.bottom + 120) // Extra height for the legend and label
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a tooltip div
const tooltip = d3.select("body").append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "lightgray")
  .style("padding", "5px")
  .style("border-radius", "5px");

// Load data from CSV
d3.csv("datasheet.csv").then(data => {
  
  // Convert necessary fields to numbers
  data.forEach(d => {
    d.salary_in_usd = +d.salary_in_usd; // Convert salary to a number
    d.remote_ratio = +d.remote_ratio;   // Convert remote ratio to a number
  });

  // Bubble chart setup
  const xBubble = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.salary_in_usd)])
    .range([0, width]);

  const yBubble = d3.scaleLinear()
    .domain([0, 100]) // Remote ratio (0 to 100%)
    .range([heightBubbleChart, 0]);

  const sizeBubble = d3.scaleOrdinal()
    .domain(['S', 'M', 'L'])  // Company sizes: Small, Medium, Large
    .range([10, 20, 30]);      // Bubble sizes for each company size

  const colorBubble = d3.scaleOrdinal()
    .domain(['EN', 'MI', 'SE', 'EX'])   // Experience levels
    .range(['#1E90FF', '#87CEEB', '#32CD32', '#FFD700']); // Colors for each level

  // Add X-axis
  bubbleSvg.append("g")
    .attr("transform", `translate(0, ${heightBubbleChart})`)
    .call(d3.axisBottom(xBubble).ticks(5).tickFormat(d => `$${d / 1000}k`));

  // Add Y-axis
  bubbleSvg.append("g")
    .call(d3.axisLeft(yBubble));

  // Add bubbles with hover effects and tooltips
  bubbleSvg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xBubble(d.salary_in_usd))
    .attr("cy", d => yBubble(d.remote_ratio))
    .attr("r", 0) // Start with a radius of 0 for animation
    .attr("fill", d => colorBubble(d.experience_level))
    .attr("opacity", 0.7)
    .attr("stroke", "black")
    .transition() // Add the transition to animate the bubbles
    .duration(1000) // Animation duration (1 second)
    .attr("r", d => sizeBubble(d.company_size)); // Grow the bubbles to their final size

  // Hover animation and tooltip for the bubbles
  bubbleSvg.selectAll("circle")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d => sizeBubble(d.company_size) + 5) // Expand the bubble slightly
        .attr("fill", "orange"); // Change color to orange on hover
      
      tooltip.style("visibility", "visible")
        .html(`
          <strong>Job Title:</strong> ${d.job_title}<br>
          <strong>Salary:</strong> $${d.salary_in_usd.toLocaleString()}<br>
          <strong>Remote Ratio:</strong> ${d.remote_ratio}%<br>
          <strong>Experience Level:</strong> ${d.experience_level}<br>
          <strong>Company Size:</strong> ${d.company_size === 'S' ? 'Small' : d.company_size === 'M' ? 'Medium' : 'Large'}
        `);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d => sizeBubble(d.company_size)) // Revert to original size
        .attr("fill", d => colorBubble(d.experience_level)); // Revert to original color
      
      tooltip.style("visibility", "hidden"); // Hide the tooltip
    });

  // X-axis label (moved below the color legend)
  bubbleSvg.append("text")
    .attr("x", width / 2)
    .attr("y", heightBubbleChart + margin.bottom + 80) // Move label down below the color bar
    .attr("text-anchor", "middle")
    .text("Salary (USD)");

  // Y-axis label
  bubbleSvg.append("text")
    .attr("x", -heightBubbleChart / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Remote Ratio (%)");

  // Chart title
  bubbleSvg.append("text")
    .attr("x", width / 2)
    .attr("y", -30) // Position title 30px above the chart
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Salary vs Remote Ratio by Job Title with Company Size and Experience Level");

  // === Color-coded salary legend ===
  const legendWidth = 300; // Width of the color legend bar
  const legendHeight = 20; // Height of the legend bar

  // Create a group for the legend and position it below the chart
  const legendGroup = bubbleSvg.append("g")
    .attr("transform", `translate(${width / 2 - legendWidth / 2}, ${heightBubbleChart + 40})`); // Moved down for spacing

  // Create a gradient for the legend
  const defs = bubbleSvg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

  // Define the gradient stops
  linearGradient.selectAll("stop")
    .data(d3.range(0, 1.05, 0.05))
    .enter().append("stop")
    .attr("offset", d => `${d * 100}%`)
    .attr("stop-color", d => d3.interpolateViridis(d));

  // Append a rectangle for the gradient
  legendGroup.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient)");

  // Define the scale for the legend axis (salary in USD)
  const salaryRange = d3.extent(data, d => d.salary_in_usd);
  const legendScale = d3.scaleLinear()
    .domain(salaryRange)
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d3.format("$.0s")); // Format as dollars

  // Add the axis below the legend bar
  legendGroup.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);

});
