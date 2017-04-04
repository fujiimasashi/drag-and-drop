(function() {
      /**
       * タスク一覧 ドラッグアンドドロップスクリプト
       */
      dragAndDrop = function() {
        this.init();
        this.num = null;
        this.isDragging = false;
        this.isCreating = false;
        this.clearTimeout = null;
        this.draggingHeight = 0;
        this.$item = null;
        this.taskNum = null;
        this.timerX = null;
        this.timerY = null;
        this.timerDrag = null;
        this.distanceFrag = false;
        this.key = null;
        this.handler = (function() {
          var events = {};
          var key = 0;
          return {
            addListener: function(target, type, listener, capture) {
              target.addEventListener(type, listener, capture);
              events[key] = {
                target: target,
                type: type,
                listener: listener,
                capture: capture
              };
              return key++;
            },
            removeListener: function(key) {
              if (key in events) {
                var e = events[key];
                e.target.removeEventListener(e.type, e.listener, e.capture);
              }
            }
          };
        }());
      };
      dragAndDrop.prototype = {
        init: function() {
          this.setNode();
          this.deviceCheck();
          this.setEvent();
        },
        deviceCheck: function() {
          this.supportTouch = 'ontouchstart' in window;
          this.startEvent = this.supportTouch ? 'touchstart' : 'mousedown';
          this.moveEvent = this.supportTouch ? 'touchmove' : 'mousemove';
          this.endEvent = this.supportTouch ? 'touchend' : 'mouseup';
          this.delayTimer = this.supportTouch ? '300' : '1';
        },
        deviceCheckPagePos: function(e) {
          return {
            x: this.supportTouch ? e.changedTouches[0].pageX : e.pageX,
            y: this.supportTouch ? e.changedTouches[0].pageY : e.pageY
          };
        },
        setNode: function() {
          this.$controller = document.querySelector('.task_wall_list');
          this.$wallList = this.$controller.querySelector('.wall-list');
          this.$taskDetail = this.$controller.querySelectorAll('.task-detail');
          this.$taskList = this.$controller.querySelectorAll('.task-list');
          this.$item = this.$controller.querySelectorAll('.task-list-item');
          this.$target = null;
        },
        setEvent: function() {
          for (var i = 0; i < this.$item.length; i++) {
            this.$item[i].addEventListener(this.startEvent, this.dragMark, false);
            this.$item[i].addEventListener(this.startEvent, this.dragStart.bind(this), false);
          }
          for (var j = 0; j < this.$taskList.length; j++) {
            this.$taskList[j].addEventListener('scroll', this.draggingClear.bind(this), false);
          }
          this.$wallList.addEventListener('scroll', this.draggingClear.bind(this), false);
          var self2 = this;
          self.removeEvent = function() {
            self2.dragEnd();
          };
        },
        dragMark: function(e) {
          var dragCheck = document.querySelectorAll('.drag');
          if (dragCheck.length !== 0) {
            for (var i = 0; i < dragCheck.length; i++) {
              dragCheck[i].classList.remove('drag');
            }
          }
          this.classList.add('drag');
        },
        draggingClear: function() {
          clearTimeout(this.timerDrag);
          if (this.$target !== null) {
            this.$target.classList.remove('drag');
          }
        },
        dragStart: function(e) {
          clearTimeout(this.timerDrag);
          this.currentX = this.deviceCheckPagePos(e).x;
          this.currentY = this.deviceCheckPagePos(e).y;
          var self = this;
          this.timerDrag = setTimeout(function(e) {
            self.dragStartSet(e);
            self.key = self.handler.addListener(document, self.moveEvent, (function(e) {
              return function(e) {
                self.dragging(e);
              };
            })(), false);
            document.addEventListener(self.endEvent, self.dragEnd.bind(self), false);
          }, self.delayTimer);
        },
        dragStartSet: function(e) {
          this.isDragging = true;
          this.$target = this.$controller.querySelector('.task-list-item.drag');
          this.dragPosLeft = this.coords(this.$target).x1;
          this.dragPosTop = this.coords(this.$target).y1;
          this.$node = this.$target.parentNode;
          this.$taskDetail = this.$controller.querySelectorAll('.task-detail');
          this.$taskList = this.$controller.querySelectorAll('.task-list');
          this.$item = this.$controller.querySelectorAll('.task-list-item');
        },
        dragging: function(e) {
          clearTimeout(this.timerDrag);
          if (!this.isDragging) return;
          e.preventDefault();
          if (!this.isCreating) {
            this.dummyItemCreateFirst(this.$target, this.insertDirection);
            this.dragItemCreate(this.$target);
            this.isCreating = true;
          }
          this.draggingItem = this.$controller.querySelector('.dragging-item');
          this.dragItemStyleSet(this.draggingItem);
          var distanceX = this.deviceCheckPagePos(e).x - this.currentX;
          var distanceY = this.deviceCheckPagePos(e).y - this.currentY;
          if (!(distanceX === 0 && distanceY === 0)) {
            this.distanceFrag = true;
          }
          if (!this.distanceFrag) return;
          var nextX = this.dragPosLeft + distanceX;
          var nextY = this.dragPosTop + distanceY;
          this.draggingItem.style.left = nextX + 'px';
          this.draggingItem.style.top = nextY + 'px';
          this.scrollX();
          this.collision();
        },
        dragEnd: function() {
          this.handler.removeListener(this.key);
          document.removeEventListener(this.endEvent, this.dragEnd.bind(this), false);
          clearTimeout(this.timerDrag);
          clearInterval(this.timerX);
          clearInterval(this.timerY);
          if (!this.isDragging) return;
          if (this.distanceFrag) {
            this.insertDraggingItem(this.draggingItem);
            this.postItemData();
          }
          this.distanceFrag = false;
          this.isDragging = false;
          this.isCreating = false;
          this.$item = this.$controller.querySelectorAll('.task-list-item');
        },
        postItemData: function() {
          var statusId = Number(this.$taskList[this.taskNum].getAttribute('data-statusId'));
          var taskListItem = this.$taskList[this.taskNum].querySelectorAll('.task-list-item');
          var taskIds = [];
          for (var i = 0; i < taskListItem.length; i++) {
            taskIds.push(taskListItem[i].firstElementChild.getAttribute('data-taskid'));
          }
          Restangular.all('task/move').post({
            project_id: self.projectId,
            task_ids: taskIds,
            status_id: statusId
          }).then(function(data) {

          }).finally(function(data) {

          });
        },
        insertDraggingItem: function($element) {
          var dummyItem = this.$controller.querySelector('.dummy-item');
          var itemWrap = document.createElement('div');
          itemWrap.classList.add('task-list-item');
          itemWrap.classList.add('insertItem');
          itemWrap.appendChild($element.children[0]);
          dummyItem.parentNode.insertBefore(itemWrap, dummyItem);
          this.dummyItemDelete();
          $element.parentNode.removeChild($element);
          var insertItem = this.$controller.querySelector('.insertItem');
          insertItem.addEventListener(this.startEvent, this.dragMark, false);
          insertItem.addEventListener(this.startEvent, this.dragStart.bind(this), false);
          insertItem.classList.remove('insertItem');
        },
        dummyItemCreateFirst: function($element, insertDirection, count) {
          this.draggingHeight = $element.clientHeight;
          var dummyItem = document.createElement('div');
          var dummyItemInner = document.createElement('div');
          dummyItemInner.classList.add('dummy-item-inner');
          dummyItem.appendChild(dummyItemInner);
          dummyItem.classList.add('dummy-item');
          $element.parentNode.insertBefore(dummyItem, $element);
          this.$controller.querySelector('.dummy-item-inner').style.height =
            this.draggingHeight + 'px';
        },
        dummyItemCreateDragging: function($element, insertDirection) {
          var dummyItem = document.createElement('div');
          var dummyItemInner = document.createElement('div');
          dummyItemInner.classList.add('dummy-item-inner');
          dummyItem.appendChild(dummyItemInner);
          dummyItem.classList.add('dummy-item');

          if (insertDirection === 'T') {
            if (!$element) return;
            if ($element.previousElementSibling === null) {
              this.insertDummyItem(insertDirection, dummyItem, $element, this.draggingHeight);
              return;
            }
            if ($element.previousElementSibling.classList.contains("dummy-item")) return;
            this.insertDummyItem(insertDirection, dummyItem, $element, this.draggingHeight);
          }

          if (insertDirection === 'B') {
            if (!$element) return;
            if ($element.nextElementSibling === null) {
              this.insertDummyItem(insertDirection, dummyItem, $element, this.draggingHeight);
              return;
            }
            if ($element.nextElementSibling.classList.contains("dummy-item")) return;
            this.insertDummyItem(insertDirection, dummyItem, $element, this.draggingHeight);
          }
        },
        dummyItemCreateDragging2: function($element) {
          var dummyItem = document.createElement('div');
          var dummyItemInner = document.createElement('div');
          dummyItemInner.classList.add('dummy-item-inner');
          dummyItem.appendChild(dummyItemInner);
          dummyItem.classList.add('dummy-item');

          var dummyItemCheck = $element.firstElementChild;
          if (dummyItemCheck) return;
          this.dummyItemDelete();
          $element.appendChild(dummyItem);
          $element.firstElementChild.firstElementChild.style.height = this.draggingHeight + 'px';
        },
        insertDummyItem: function(direction, dummyItem, $element, dragHeight) {
          if (direction === 'T') {
            this.dummyItemDelete();
            $element.parentNode.insertBefore(dummyItem, $element);
            $element.previousElementSibling.firstElementChild.style.height = dragHeight + 'px';
          }
          if (direction === 'B') {
            this.dummyItemDelete();
            $element.parentNode.insertBefore(dummyItem, $element.nextSibling);
            $element.nextElementSibling.firstElementChild.style.height = dragHeight + 'px';
          }
        },
        dummyItemDelete: function($element) {
          var $dummyItem = this.$controller.querySelector('.dummy-item');
          $dummyItem.parentNode.removeChild($dummyItem);
        },
        dragItemCreate: function($element) {
          var dragWrap = document.createElement('div');
          dragWrap.classList.add('dragging-item');
          dragWrap.appendChild($element.children[0]);
          this.$controller.appendChild(dragWrap);
          $element.parentNode.removeChild($element);
        },
        dragItemStyleSet: function($element) {
          $element.style.left = this.dragPosLeft + 'px';
          $element.style.top = this.dragPosTop + 'px';
          $element.style.height = this.dragHeight + 'px';
        },
        collision: function(e) {
          var draggingItem = this.coords(this.draggingItem);
          var collidersDataTaskDetail = [];
          var collidersData = [];
          var rangeArrayTaskDetail = [];
          var rangeArray = [];

          for (var key = 0; key < this.$taskDetail.length; key++) {
            var taskDetail = this.coords(this.$taskDetail[key]);
            if (this.overlaps(draggingItem, taskDetail)) {
              var colliderDataTaskDetail = {
                range: this.overlapsRange(draggingItem, taskDetail),
                count: key
              };
              collidersDataTaskDetail.push(colliderDataTaskDetail);
              rangeArrayTaskDetail.push(colliderDataTaskDetail.range);
            }
          }

          var taskDetailMaxRange = Math.max.apply(null, rangeArrayTaskDetail);

          for (var i = 0; i < collidersDataTaskDetail.length; i++) {
            if (collidersDataTaskDetail[i].range === taskDetailMaxRange) {
              var countTaskDetail = this.taskNum = collidersDataTaskDetail[i].count;
              var taskListItem =
                this.$taskList[countTaskDetail].querySelectorAll('.task-list-item');

              if (taskListItem.length === 0) {
                this.dummyItemCreateDragging2(this.$taskList[countTaskDetail]);
              } else {
                this.scrollY(countTaskDetail, draggingItem);

                for (var j = 0; j < taskListItem.length; j++) {
                  var item = this.coords(taskListItem[j]);
                  var insertDirection = this.overlapsDirection(draggingItem, item);
                  var overlapsRange = this.overlapsRange(draggingItem, item);
                  var colliderData = {
                    direction: insertDirection,
                    range: overlapsRange,
                    count: j
                  };
                  collidersData.push(colliderData);
                  rangeArray.push(colliderData.range);
                }
                var maxRangeValue = Math.max.apply(null, rangeArray);
                for (var k = 0; k < collidersData.length; k++) {
                  if (collidersData[k].range === maxRangeValue) {
                    this.dummyItemCreateDragging(taskListItem[k], collidersData[k].direction);
                  }
                }
              }
            }
          }
        },
        // a:看板エリア、s:スクロール量、r:看板エリア内を計算、c:itemの中央値
        coords: function(d) {
          var taskDetail = d.classList.contains("task-detail");
          var draggingItem = d.classList.contains("dragging-item");
          var w = d.clientWidth;
          var h = d.clientHeight;
          var sx = taskDetail ? d.parentNode.parentNode.scrollLeft :
            d.parentNode.parentNode.parentNode.parentNode.scrollLeft;
          var sy = d.parentNode.scrollTop;
          var px = d.parentNode.parentNode.offsetLeft;
          var py = 0;
          var x1 = d.offsetLeft + px - sx;
          var y1 = d.offsetTop + py - sy;
          var x2 = x1 + w;
          var y2 = y1 + h;
          var ax1 = d.parentNode.offsetLeft + px - sx;
          var ay1 = d.parentNode.offsetTop + py;
          var ax2 = ax1 + d.parentNode.clientWidth;
          var ay2 = ay1 + d.parentNode.clientHeight;
          var ry1 = Math.max(y1, ay1);
          var ry2 = Math.min(y2, ay2);
          var cx = x1 + (w / 2);
          var cy = y1 + (h / 2);

          return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            ry1: ry1,
            ry2: ry2,
            ax1: ax1,
            ay1: ay1,
            ax2: ax2,
            ay2: ay2,
            cx: cx,
            cy: cy
          };
        },
        scrollX: function() {
          var windowWidth = {x1: 0, x2: $window.innerWidth};
          var draggingItem = this.coords(this.draggingItem);
          var locatingX = this.locatingsX(draggingItem, windowWidth);
          var walllist = this.$wallList;
          if (locatingX.d) {
            clearInterval(this.timerX);
            this.timerX = setInterval(function() {
              var scrollpos = walllist.scrollLeft - locatingX.p / 50;
              walllist.scrollLeft = scrollpos;
            }, 1);
          } else {
            clearInterval(this.timerX);
          }
        },
        locatingsX: function(a, b) {
          var L = false;
          var R = false;
          var P;
          var D;
          var left = b.x1 - 60 - a.x1;
          var right = b.x2 - 60 - a.x2;

          if (b.x1 - 60 >= a.x1) L = true;
          if (b.x2 - 60 <= a.x2) R = true;

          if (-left < right) {
            P = left;
            D = L;
          } else {
            P = right;
            D = R;
          }

          return {p: P, d: D};
        },
        scrollY: function(count, draggingItem) {
          var taskDetail = this.coords(this.$taskDetail[count]);
          var locatingY = this.locatingsY(draggingItem, taskDetail);
          var tasklist = this.$taskList[count];
          if (locatingY.d) {
            clearInterval(this.timerY);
            this.timerY = setInterval(function() {
              var scrollpos = tasklist.scrollTop - locatingY.p / 50;
              tasklist.scrollTop = scrollpos;
            }, 1);
          } else {
            clearInterval(this.timerY);
          }
        },
        locatingsY: function(a, b) {
          var T = false;
          var B = false;
          var P;
          var D;
          var top = b.y1 + 100 - a.y1;
          var bottom = b.y2 - 160 - a.y2;

          if (b.y1 + 100 >= a.y1) T = true;
          if (b.y2 - 160 <= a.y2) B = true;

          if (-top < bottom) {
            P = top;
            D = T;
          } else {
            P = bottom;
            D = B;
          }

          return {p: P, d: D};
        },
        overlaps: function(a, b) {
          var x = false;
          var y = false;

          if ((b.x1 >= a.x1 && b.x1 <= a.x2) || (b.x2 >= a.x1 && b.x2 <= a.x2) ||
              (a.x1 >= b.x1 && a.x2 <= b.x2)) {
            x = true;
          }

          if ((b.ry1 >= a.y1 && b.ry1 <= a.y2) || (b.ry2 >= a.y1 && b.ry2 <= a.y2) ||
              (a.y1 >= b.y1 && a.y2 <= b.ry2)) {
            y = true;
          }

          if (b.y2 < b.ay1 || b.y1 > b.ay2) {
            y = false;
          }

          return (x && y);
        },
        overlapsDirection: function(a, b) {
          var directionY = '';

          if (a.cy <= b.cy) {
            directionY = 'T';
          }
          if (a.cy > b.cy) {
            directionY = 'B';
          }

          return directionY;
        },
        overlapsRange: function(a, b) {
          var x1 = Math.max(a.x1, b.x1);
          var y1 = Math.max(a.y1, b.y1);
          var x2 = Math.min(a.x2, b.x2);
          var y2 = Math.min(a.y2, b.y2);

          return (x2 - x1) * (y2 - y1);
        }
      };

      new dragAndDrop();

})();