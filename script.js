// Obtener el conjunto de datos
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  .then(response => response.json())
  .then(data => {
    // Constantes para el gráfico
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Parsear la fecha y hora
    const parseTime = d3.timeParse('%M:%S');
    data.forEach(d => {
      const parsedTime = parseTime(d.Time);
      d.Time = new Date(1970, 0, 1, 0, parsedTime.getMinutes(), parsedTime.getSeconds());
    });

    // Crear escalas para los ejes x e y
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.Year - 1), d3.max(data, d => d.Year + 1)])
      .range([0, width]);

    const yScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Time))
      .range([height, 0]);

    // Crear ejes x e y
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

    // Crear el gráfico de dispersión
    const svg = d3.select('#scatterplot')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Agregar eje x
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    // Agregar eje y
    svg.append('g')
      .attr('id', 'y-axis')
      .call(yAxis);

    // Agregar puntos
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.Year))
      .attr('cy', d => yScale(d.Time))
      .attr('r', 5)
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', d => d.Time.toISOString())
      .on('mouseover', (event, d) => {
        const tooltip = d3.select('#tooltip');
        tooltip.attr('data-year', d.Year)
          .html(`${d.Name}: ${d.Nationality}<br>Year: ${d.Year}, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds()}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY}px`)
          .transition()
          .duration(200)
          .style('opacity', 0.9);
      })
      .on('mouseout', () => {
        const tooltip = d3.select('#tooltip');
        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      });

    // Agregar leyenda
    const legend = svg.append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${width - 180}, ${height - 20})`);

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', '#cb34d0');

    legend.append('text')
      .attr('x', 15)
      .attr('y', 10)
      .text('No doping allegations');
  });

