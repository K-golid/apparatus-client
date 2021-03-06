import ApparatusBuilder from 'apparatus-generator';
import Justeer from 'justeer';
import Simplex from 'simplex-noise';
import * as dat from 'dat.gui';
import * as tome from 'chromotome';

import roughLine from './graphite.js';
import presets from './presets_rough.js';

window.onload = function () {
  var canvas = document.createElement('canvas');

  canvas.width = '2500';
  canvas.height = '3500';

  // canvas.style.width = '1200px';
  // canvas.style.height = '1000px';

  var container = document.getElementById('sketch');
  container.appendChild(canvas);

  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1c2021';

    let options = {
      cell_size: 10,
      cell_pad: 10,
      radius_x: 14,
      radius_y: 14,
      h_symmetric: false,
      v_symmetric: false,
      simple: false,
      roundness: 0.1,
      solidness: 0.5,
      compactness: 0.9,
      block_size: 0.82,
      chance_vertical: 0.5,
      rows: 3,
      columns: 5,
      padding: 40,
      display_stroke: true,
      display_fill: true,
      random_palette: false,
      palette: tome.getRandom().name,
      color_mode: 'group',
      group_size: 0.85,
      use_simplex: false,
      rate_of_change: 0.05,
      save_image: save_image,
      generate_new: run,
    };

    let gui = new dat.GUI({ load: presets });
    gui.remember(options);
    let f1 = gui.addFolder('Layout');
    f1.add(options, 'rows', 1, 20, 1).onFinishChange(run);
    f1.add(options, 'columns', 1, 20, 1).onFinishChange(run);
    f1.add(options, 'padding', 0, 300, 15).onFinishChange(run);

    let f2 = gui.addFolder('Apparatus Shape');
    f2.add(options, 'cell_size', 2, 45, 1).onFinishChange(run);
    f2.add(options, 'cell_pad', -20, 25, 1).onFinishChange(run);
    f2.add(options, 'radius_x', 5, 30, 1).onFinishChange(run);
    f2.add(options, 'radius_y', 5, 30, 1).onFinishChange(run);
    f2.add(options, 'simple').onFinishChange(run);
    f2.add(options, 'roundness', 0, 1, 0.1).onFinishChange(run);
    f2.add(options, 'solidness', 0.1, 1, 0.05).onFinishChange(run);
    f2.add(options, 'compactness', 0.5, 1, 0.02).onFinishChange(run);
    f2.add(options, 'block_size', 0.5, 1, 0.02).onFinishChange(run);
    f2.add(options, 'chance_vertical', 0, 1, 0.1).onFinishChange(run);
    f2.add(options, 'h_symmetric').onFinishChange(run);
    f2.add(options, 'v_symmetric').onFinishChange(run);
    f2.add(options, 'use_simplex').onFinishChange(run);
    f2.add(options, 'rate_of_change', 0, 0.1, 0.005).onFinishChange(run);

    let f3 = gui.addFolder('Apparatus Looks');
    f3.add(options, 'display_stroke').onFinishChange(run);
    f3.add(options, 'display_fill').onFinishChange(run);
    f3.add(options, 'random_palette').onFinishChange(run);
    f3.add(options, 'palette', tome.getNames()).onFinishChange(run);
    f3.add(options, 'color_mode', ['single', 'main', 'group', 'random']).onChange(run);
    f3.add(options, 'group_size', 0.5, 1, 0.02).onFinishChange(run);

    let f4 = gui.addFolder('Controller');
    f4.add(options, 'generate_new');
    f4.add(options, 'save_image');

    let apparatus = setup_apparatus(options);
    display(ctx, apparatus, options);

    function run() {
      apparatus = setup_apparatus(options);
      display(ctx, apparatus, options);
    }

    function save_image() {
      var image = canvas
        .toDataURL('image/jpeg', 1.0)
        .replace('image/jpeg', 'image/octet-stream');
      window.location.href = image;
    }
  }

  function setup_apparatus(options) {
    const colors = tome.get(options.palette).colors;
    const simplex = options.use_simplex ? new Simplex('hello') : null;

    let opts = {
      initiate_chance: options.compactness,
      extension_chance: options.block_size,
      vertical_chance: options.chance_vertical,
      horizontal_symmetry: options.h_symmetric,
      vertical_symmetry: options.v_symmetric,
      simple: options.simple,
      roundness: options.roundness,
      solidness: options.solidness,
      colors: colors,
      color_mode: options.color_mode,
      group_size: options.group_size,
      simplex: simplex,
      rate_of_change: options.rate_of_change,
    };

    return new ApparatusBuilder(options.radius_x, options.radius_y, opts);
  }

  function display(ctx, apparatus, options) {
    let padding = 2 * options.padding - 150;
    let nx = options.columns;
    let ny = options.rows;

    let justify_x = new Justeer(
      canvas.width,
      nx,
      apparatus.xdim * (options.cell_size + options.cell_pad)
    );
    let justify_y = new Justeer(
      canvas.height,
      ny,
      apparatus.ydim * (options.cell_size + options.cell_pad)
      //(Math.sqrt(3) * apparatus.ydim * (options.cell_size + options.cell_pad)) / 2
    );
    let place_x = justify_x.placement_given_spacing_between_elements(padding);
    let place_y = justify_y.placement_given_spacing_between_elements(
      (Math.sqrt(3) * padding) / 2
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = tome.get(options.palette).background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //drawFrame(ctx);

    for (let i = 0; i < ny; i++) {
      for (let j = 0; j < nx; j++) {
        ctx.save();
        ctx.translate(place_x(j), place_y(i));
        const offset =
          (apparatus.xdim * (options.cell_size + options.cell_pad) + padding) / 2;
        //ctx.translate(i % 2 !== 0 ? 0 : offset, 0);
        if (options.random_palette) apparatus.colors = tome.getRandom().colors;
        let grid = apparatus.generate(null, null, false, i * nx + j, 0);
        ctx.lineCap = 'square';
        ctx.lineWidth = '2';
        display_apparatus2(ctx, grid, options);
        ctx.restore();
      }
    }
  }

  function display_apparatus(ctx, rects, options) {
    const { cell_size, cell_pad, display_stroke, display_fill } = options;
    rects.forEach((rect) => {
      ctx.beginPath();
      ctx.rect(
        rect.x1 * cell_size - 1,
        rect.y1 * cell_size - 1,
        rect.w * cell_size + 1,
        rect.h * cell_size + 1
      );
      ctx.fillStyle = rect.col;
      ctx.fill();
      if (display_stroke) ctx.stroke();
    });
  }

  function display_apparatus2(ctx, rects, options) {
    const { cell_size, cell_pad, display_stroke, display_fill } = options;
    let stroke_color = tome.get(options.palette).stroke;
    stroke_color = stroke_color ? stroke_color : '#0e0e0e';

    const roughRects = rects.map((rect) => {
      const points = getRectPoints(
        rect.x1 * (cell_size + cell_pad),
        rect.y1 * (cell_size + cell_pad),
        rect.w * (cell_size + cell_pad) - cell_pad,
        rect.h * (cell_size + cell_pad) - cell_pad
      );
      const shade_points = getRectPoints(
        (rect.x1 - 0.5) * (cell_size + cell_pad),
        (rect.y1 + 0.8) * (cell_size + cell_pad),
        rect.w * (cell_size + cell_pad) - cell_pad,
        rect.h * (cell_size + cell_pad) - cell_pad
      );
      return { ...rect, points, shade_points };
    });

    if (display_fill) {
      ctx.globalCompositeOperation = 'normal';
      //ctx.globalAlpha = 0.1;
      roughRects.forEach((rect) => {
        drawPoints(ctx, rect.shade_points, stroke_color, null);
      });

      ctx.globalAlpha = 1;
      roughRects.forEach((rect) => {
        drawPoints(ctx, rect.points, '#fff', null);
      });
      ctx.globalCompositeOperation = 'multiply';
      roughRects.forEach((rect) => {
        drawPoints(ctx, rect.points, rect.col, null);
      });
    }

    if (display_stroke) {
      roughRects.forEach((rect) => {
        const points = getRectPoints(
          rect.x1 * (cell_size + cell_pad),
          rect.y1 * (cell_size + cell_pad),
          rect.w * (cell_size + cell_pad) - cell_pad,
          rect.h * (cell_size + cell_pad) - cell_pad
        );
        ctx.lineCap = 'round';
        drawPoints(ctx, points, null, stroke_color);
      });
    }
  }

  function getRectPoints(px, py, sx, sy) {
    const nw = changeBase(px, py);
    const ne = changeBase(px + sx, py);
    const se = changeBase(px + sx, py + sy);
    const sw = changeBase(px, py + sy);

    const north = roughLine(nw, ne);
    const east = roughLine(ne, se);
    const south = roughLine(se, sw);
    const west = roughLine(sw, nw);

    return [...north, ...east, ...south, ...west];
  }

  function changeBase(x, y) {
    var u1 = [0.9, -0.1];
    var u2 = [0.3, 0.8];

    const cx = x * u1[0] + y * u2[0];
    const cy = x * u1[1] + y * u2[1];

    return [cx, cy];
  }

  function drawFrame(ctx) {
    ctx.fillStyle = '#000';
    ctx.globalCompositeOperation = 'normal';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(150, 150, canvas.width - 150, canvas.height - 150);
  }

  function drawPoints(ctx, points, col, strokeCol) {
    ctx.beginPath();
    ctx.moveTo(points[0].a[0], points[0].a[1]);
    for (let i = 1; i < points.length; i++) {
      let p1 = points[i - 1];
      let p2 = points[i];
      ctx.bezierCurveTo(
        p1.cp2 ? p1.cp2[0] : p1.a[0],
        p1.cp2 ? p1.cp2[1] : p1.a[1],
        p2.cp1 ? p2.cp1[0] : p2.a[0],
        p2.cp1 ? p2.cp1[1] : p2.a[1],
        p2.a[0],
        p2.a[1]
      );
    }
    if (col != null) {
      ctx.fillStyle = col;
      ctx.fill();
    }
    if (strokeCol != null) {
      ctx.strokeStyle = strokeCol;
      ctx.strokeWeight = 2;
      ctx.stroke();
    }
  }
};
