// Obtener el conjunto de datos
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  .then(response => response.json())
  .then(data => {
    // Constantes para el gráfico
    const margen = { superior: 40, derecho: 20, inferior: 60, izquierdo: 60 };
    const ancho = 800 - margen.izquierdo - margen.derecho;
    const alto = 400 - margen.superior - margen.inferior;

    // Analizar la fecha y hora
    const parseTime = d3.timeParse('%M:%S');
    data.forEach(d => {
      const tiempoParseado = parseTime(d.Time);
      d.Time = new Date(1970, 0, 1, 0, tiempoParseado.getMinutes(), tiempoParseado.getSeconds());
    });

    // Crear escalas para los ejes x e y
    const escalaX = d3.scaleLinear()
      .domain([d3.min(data, d => d.Year - 1), d3.max(data, d => d.Year + 1)])
      .range([0, ancho]);

    const escalaY = d3.scaleTime()
      .domain(d3.extent(data, d => d.Time))
      .range([alto, 0]);

    // Crear los ejes x e y
    const ejeX = d3.axisBottom(escalaX).tickFormat(d3.format('d'));
    const ejeY = d3.axisLeft(escalaY).tickFormat(d3.timeFormat('%M:%S'));

    // Crear el gráfico de dispersión
    const svg = d3.select('#scatterplot')
      .attr('width', ancho + margen.izquierdo + margen.derecho)
      .attr('height', alto + margen.superior + margen.inferior)
      .append('g')
      .attr('transform', `translate(${margen.izquierdo}, ${margen.superior})`);

    // Agregar el eje x
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${alto})`)
      .call(ejeX);

    // Agregar el eje y
    svg.append('g')
      .attr('id', 'y-axis')
      .call(ejeY);

    // Agregar los puntos
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => escalaX(d.Year))
      .attr('cy', d => escalaY(d.Time))
      .attr('r', 5)
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', d => d.Time.toISOString())
      .on('mouseover', (event, d) => {
        const tooltip = d3.select('#tooltip');
        tooltip.attr('data-year', d.Year)
          .html(`${d.Name}: ${d.Nationality}<br>Año: ${d.Year}, Tiempo: ${d.Time.getMinutes()}:${d.Time.getSeconds()}`)
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

    // Agregar la leyenda
    const leyenda = svg.append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${ancho - 180}, ${alto - 20})`);

    leyenda.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', '#cb34d0');

    leyenda.append('text')
      .attr('x', 15)
      .attr('y', 10)
      .text('Sin acusaciones de dopaje');
  });

