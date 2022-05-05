var gulp       = require('gulp'), // Подключаем Gulp
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync  = require('browser-sync').create(), // Подключаем Browser Sync
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    gcmq           = require('gulp-group-css-media-queries'),
    spritesmith = require("gulp.spritesmith"),
    plumber = require('gulp-plumber'), // Чтоб при ошибке не падал сервер
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов
	var buffer = require('vinyl-buffer');
	var csso = require('gulp-csso');
	var imagemin = require('gulp-imagemin');
	var merge = require('merge-stream');
	var del = require('del');
  var smartGrid = require('smart-grid');
  var gridOptPath = './app/smart_grid_conf.js';
  var path = require('path');
  var fileinclude = require('gulp-file-include');
  const sourcemaps = require('gulp-sourcemaps');
  const uglify = require('gulp-uglify-es').default;
  const { src, dest, parallel, series } = require('gulp');
  const newer = require('gulp-newer');

	function style(){
        return gulp.src('app/sass/**/*.scss')
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 9'], { cascade: true })) // Создаем префиксы
        .pipe(gcmq())
        .pipe(sourcemaps.init())
        .pipe(csso({
            restructure: true,
            sourceMap: true,
            debug: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.stream());
	}

	function js(){
		return gulp.src(['app/js/common.js'])
        .pipe(concat('common.min.js'))
        .pipe(uglify({
            compress: {
              unused: false
            }
          })) // Сжимаем JavaScript
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.stream());
  }

 


  function images() {
	return src('app/img/src/**/*') // Берём все изображения из папки источника
	.pipe(newer('app/img/dist/')) // Проверяем, было ли изменено (сжато) изображение ранее
	.pipe(imagemin()) // Сжимаем и оптимизируем изображеня
	.pipe(dest('app/img/dist/')) // Выгружаем оптимизированные изображения в папку назначения
}
function cleanimg() {
	return del('app/img/dist/**/*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}

  function html() {
    return gulp.src('app/html/*.html')
    .pipe(fileinclude({
			prefix: '@@',
			basepath: 'app/includes/'
		}))
		.pipe(browserSync.reload({stream: true}))
		.pipe(gulp.dest('app/'));
  }

	function watch(){
		browserSync.init({
			server: {
				baseDir: 'app'
			}
		});

		gulp.watch('app/sass/**/*.scss', style);
		gulp.watch('app/html/*.html', html);
		gulp.watch('app/includes/*.html', html);
        gulp.watch(['app/**/*.js', '!app/**/*.min.js'], js);
        gulp.watch('app/imgs/src/**/*', images);
		gulp.watch('app/*.html').on('change', browserSync.reload);
		// gulp.watch('app/js/*.js').on('change', browserSync.reload);
	}

	// Сборка спрайтов PNG
  gulp.task('spritemade', function () {
  // Generate our spritesheet
  var spriteData = gulp.src('app/img/icons/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss'
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('app/img'));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    // .pipe(csso())
    .pipe(gulp.dest('app/sass/global/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

function cleandist() {
	return del('dist/**/*', { force: true }) // Удаляем всё содержимое папки "dist/"
}

function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/img/dist',
		'app/fonts',
		'app/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}



function grid(done){
    smartGrid('app/sass/global', settings);
    done();
 }

gulp.task(grid, 'grid');
function deploy() {
        build();
}

function start() {
  html();
  watch();
}

exports.style = style;
exports.html = html;
exports.start = start;
exports.js = js;
exports.deploy = deploy;
exports.build = series(cleandist, style, js, images, buildcopy);
exports.images = images;
exports.cleanimg = cleanimg;



/*gulp.task("smart-grid", (cb) => {
    smartgrid(('sass/mixins/_smartgrid'), {
        outputStyle: "scss",
        filename: "_smart-grid",
        columns: 12, // number of grid columns
        offset: "30px", // gutter width
        mobileFirst: false,
        mixinNames: {
            container: "container"
        },
        container: {
            fields: "15px" // side fields
        },
        breakPoints: {
            xs: {
                width: "320px"
            },
            sm: {
                width: "576px"
            },
            md: {
                width: "768px"
            },
            lg: {
                width: "992px"
            },
            xl: {
                width: "1200px"
            }
        }
    });
    cb();
});
*/

var settings = {
    outputStyle: 'scss', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % || rem */
    mobileFirst: true, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '15px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1199px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '1024px'
        },
        sm: {
            width: '768px',
        },
        xs: {
            width: '559px'
        }
        /*
        We can create any quantity of break points.

        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};
