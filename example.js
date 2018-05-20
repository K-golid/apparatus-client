import ApparatusBuilder from './index.js';
import * as dat from './node_modules/dat.gui/build/dat.gui.module.js';

window.onload = function() {
  var canvas = document.getElementById('main_canvas');
  canvas.style.width = '1000px';
  canvas.style.height = '1000px';
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1c2021';

    let options = {
      radius: 15,
      wh_ratio: 1,
      symmetric: true,
      roundness: 0.8,
      solidness: 0.2,
      compactness: 0.94,
      block_size: 0.84,
      chance_vertical: 0.5,
      rows: 4,
      columns: 5,
      color1: '#6c843e',
      color2: '#dc383a',
      color3: '#687d99',
      color4: '#705f84',
      color5: '#fc9a1a',
      color6: '#aa3a33',
      color7: '#9c4257',
      color_mode: 'group',
      background_color: '#eeeee5'
    };

    let apparatus = setup_apparatus(options);
    display(ctx, apparatus, options);

    let gui = new dat.GUI();
    gui.remember(options);
    let f1 = gui.addFolder('Layout');
    f1.add(options, 'rows', 1, 7, 1).onFinishChange(run);
    f1.add(options, 'columns', 1, 7, 1).onFinishChange(run);

    let f2 = gui.addFolder('Apparatus Shape');
    f2.add(options, 'radius', 5, 30, 1).onFinishChange(run);
    f2.add(options, 'roundness', 0, 1, 0.1).onFinishChange(run);
    f2.add(options, 'solidness', 0.1, 1, 0.05).onFinishChange(run);
    f2.add(options, 'compactness', 0.5, 1, 0.02).onFinishChange(run);
    f2.add(options, 'block_size', 0.5, 1, 0.02).onFinishChange(run);
    f2.add(options, 'chance_vertical', 0, 1, 0.1).onFinishChange(run);
    f2.add(options, 'symmetric').onFinishChange(run);

    let f3 = gui.addFolder('Apparatus Colors');
    f3.addColor(options, 'background_color').onFinishChange(run);
    f3.addColor(options, 'color1').onFinishChange(run);
    f3.addColor(options, 'color2').onFinishChange(run);
    f3.addColor(options, 'color3').onFinishChange(run);
    f3.addColor(options, 'color4').onFinishChange(run);
    f3.addColor(options, 'color5').onFinishChange(run);
    f3.addColor(options, 'color6').onFinishChange(run);
    f3.addColor(options, 'color7').onFinishChange(run);
    f3.add(options, 'color_mode', ['single', 'main', 'group', 'random']).onChange(run);

    function run() {
      apparatus = setup_apparatus(options);
      display(ctx, apparatus, options);
    }
  }

  function setup_apparatus(options) {
    let colors = [
      options.color1,
      options.color2,
      options.color3,
      options.color4,
      options.color5,
      options.color6,
      options.color7
    ];

    return new ApparatusBuilder(
      options.radius,
      options.compactness,
      options.block_size,
      options.chance_vertical,
      colors,
      options.color_mode,
      options.symmetric,
      options.roundness,
      options.solidness
    );
  }

  function display(ctx, apparatus, options) {
    let cell_size = 10;
    let apparat_size_x = apparatus.xdim * cell_size;
    let apparat_size_y = apparatus.ydim * cell_size;

    let padding = 50;
    let nx = options.columns;
    let ny = options.rows;

    let inner_padding_x = (canvas.width - padding * 2 - nx * apparat_size_x) / (nx - 1);
    let inner_padding_y = (canvas.height - padding * 2 - ny * apparat_size_y) / (ny - 1);

    ctx.fillStyle = options.background_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(padding, padding);
    for (let i = 0; i < ny; i++) {
      ctx.save();
      for (let j = 0; j < nx; j++) {
        let grid = apparatus.generate();
        ctx.lineCap = 'square';
        ctx.lineWidth = '6';
        display_apparatus(ctx, grid, cell_size);
        ctx.lineCap = 'butt';
        ctx.lineWidth = '3';
        display_apparatus(ctx, grid, cell_size);
        ctx.translate(apparat_size_x + inner_padding_x, 0);
      }
      ctx.restore();
      ctx.translate(0, apparat_size_y + inner_padding_y);
    }
    ctx.restore();
  }

  function display_apparatus(ctx, grid, size) {
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        if (grid[i][j].in && grid[i][j].col != null) {
          ctx.beginPath();
          ctx.rect(j * size - 1, i * size - 1, size + 2, size + 2);
          ctx.fillStyle = grid[i][j].col;
          ctx.fill();
        }
      }
    }

    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        if (grid[i][j].h) {
          ctx.beginPath();
          ctx.moveTo(j * size, i * size);
          ctx.lineTo((j + 1) * size, i * size);
          ctx.stroke();
        }
        if (grid[i][j].v) {
          ctx.beginPath();
          ctx.moveTo(j * size, i * size);
          ctx.lineTo(j * size, (i + 1) * size);
          ctx.stroke();
        }
      }
    }
  }
};