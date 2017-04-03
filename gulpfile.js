var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var uglify = require("gulp-uglify");
var browser = require("browser-sync");
 
gulp.task("sass", function() {
    gulp.src("src/sass/**/*scss")
        .pipe(sass())
        .pipe(gulp.dest("./dist/css"));
});

gulp.task("sass", function() {
    gulp.src("src/sass/**/*scss")
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest("./dist/css"));
});

gulp.task("js", function() {
    gulp.src(["src/js/**/*.js"])
        .pipe(uglify())
        .pipe(gulp.dest("./dist/js"));
});

gulp.task("default", function() {
    gulp.watch(["src/js/**/*.js"],["js"]);
    gulp.watch("src/sass/**/*.scss",["sass"]);
});

gulp.task("server", function() {
    browser({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task("js", function() {
    gulp.src(["src/js/**/*.js"])
        .pipe(uglify())
        .pipe(gulp.dest("./dist/js"))
        .pipe(browser.reload({stream:true}))
});
 
gulp.task("sass", function() {
    gulp.src("src/sass/**/*scss")
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browser.reload({stream:true}))
});
 
gulp.task("default",['server'], function() {
    gulp.watch(["src/js/**/*.js"],["js"]);
    gulp.watch("src/sass/**/*.scss",["sass"]);
});