!function(){dragAndDrop=function(){this.init(),this.num=null,this.isDragging=!1,this.isCreating=!1,this.clearTimeout=null,this.draggingHeight=0,this.$item=null,this.taskNum=null,this.timerX=null,this.timerY=null,this.timerDrag=null,this.distanceFrag=!1,this.key=null,this.handler=function(){var t={},e=0;return{addListener:function(i,r,s,n){return i.addEventListener(r,s,n),t[e]={target:i,type:r,listener:s,capture:n},e++},removeListener:function(e){if(e in t){var i=t[e];i.target.removeEventListener(i.type,i.listener,i.capture)}}}}()},dragAndDrop.prototype={init:function(){this.setNode(),this.deviceCheck(),this.setEvent()},deviceCheck:function(){this.supportTouch="ontouchstart"in window,this.startEvent=this.supportTouch?"touchstart":"mousedown",this.moveEvent=this.supportTouch?"touchmove":"mousemove",this.endEvent=this.supportTouch?"touchend":"mouseup",this.delayTimer=this.supportTouch?"300":"1"},deviceCheckPagePos:function(t){return{x:this.supportTouch?t.changedTouches[0].pageX:t.pageX,y:this.supportTouch?t.changedTouches[0].pageY:t.pageY}},setNode:function(){this.$controller=document.querySelector(".task_wall_list"),this.$wallList=this.$controller.querySelector(".wall-list"),this.$taskDetail=this.$controller.querySelectorAll(".task-detail"),this.$taskList=this.$controller.querySelectorAll(".task-list"),this.$item=this.$controller.querySelectorAll(".task-list-item"),this.$target=null},setEvent:function(){for(var t=0;t<this.$item.length;t++)this.$item[t].addEventListener(this.startEvent,this.dragMark,!1),this.$item[t].addEventListener(this.startEvent,this.dragStart.bind(this),!1);for(var e=0;e<this.$taskList.length;e++)this.$taskList[e].addEventListener("scroll",this.draggingClear.bind(this),!1);this.$wallList.addEventListener("scroll",this.draggingClear.bind(this),!1);var i=this;self.removeEvent=function(){i.dragEnd()}},dragMark:function(t){var e=document.querySelectorAll(".drag");if(0!==e.length)for(var i=0;i<e.length;i++)e[i].classList.remove("drag");this.classList.add("drag")},draggingClear:function(){clearTimeout(this.timerDrag),null!==this.$target&&this.$target.classList.remove("drag")},dragStart:function(t){clearTimeout(this.timerDrag),this.currentX=this.deviceCheckPagePos(t).x,this.currentY=this.deviceCheckPagePos(t).y;var e=this;this.timerDrag=setTimeout(function(t){e.dragStartSet(t),e.key=e.handler.addListener(document,e.moveEvent,function(t){return function(t){e.dragging(t)}}(),!1),document.addEventListener(e.endEvent,e.dragEnd.bind(e),!1)},e.delayTimer)},dragStartSet:function(t){this.isDragging=!0,this.$target=this.$controller.querySelector(".task-list-item.drag"),this.dragPosLeft=this.coords(this.$target).x1,this.dragPosTop=this.coords(this.$target).y1,this.$node=this.$target.parentNode,this.$taskDetail=this.$controller.querySelectorAll(".task-detail"),this.$taskList=this.$controller.querySelectorAll(".task-list"),this.$item=this.$controller.querySelectorAll(".task-list-item")},dragging:function(t){if(clearTimeout(this.timerDrag),this.isDragging){t.preventDefault(),this.isCreating||(this.dummyItemCreateFirst(this.$target,this.insertDirection),this.dragItemCreate(this.$target),this.isCreating=!0),this.draggingItem=this.$controller.querySelector(".dragging-item"),this.dragItemStyleSet(this.draggingItem);var e=this.deviceCheckPagePos(t).x-this.currentX,i=this.deviceCheckPagePos(t).y-this.currentY;if(0===e&&0===i||(this.distanceFrag=!0),this.distanceFrag){var r=this.dragPosLeft+e,s=this.dragPosTop+i;this.draggingItem.style.left=r+"px",this.draggingItem.style.top=s+"px",this.scrollX(),this.collision()}}},dragEnd:function(){this.handler.removeListener(this.key),document.removeEventListener(this.endEvent,this.dragEnd.bind(this),!1),clearTimeout(this.timerDrag),clearInterval(this.timerX),clearInterval(this.timerY),this.isDragging&&(this.distanceFrag&&(this.insertDraggingItem(this.draggingItem),this.postItemData()),this.distanceFrag=!1,this.isDragging=!1,this.isCreating=!1,this.$item=this.$controller.querySelectorAll(".task-list-item"))},postItemData:function(){for(var t=Number(this.$taskList[this.taskNum].getAttribute("data-statusId")),e=this.$taskList[this.taskNum].querySelectorAll(".task-list-item"),i=[],r=0;r<e.length;r++)i.push(e[r].firstElementChild.getAttribute("data-taskid"));Restangular.all("task/move").post({project_id:self.projectId,task_ids:i,status_id:t}).then(function(t){}).finally(function(t){})},insertDraggingItem:function(t){var e=this.$controller.querySelector(".dummy-item"),i=document.createElement("div");i.classList.add("task-list-item"),i.classList.add("insertItem"),i.appendChild(t.children[0]),e.parentNode.insertBefore(i,e),this.dummyItemDelete(),t.parentNode.removeChild(t);var r=this.$controller.querySelector(".insertItem");r.addEventListener(this.startEvent,this.dragMark,!1),r.addEventListener(this.startEvent,this.dragStart.bind(this),!1),r.classList.remove("insertItem")},dummyItemCreateFirst:function(t,e,i){this.draggingHeight=t.clientHeight;var r=document.createElement("div"),s=document.createElement("div");s.classList.add("dummy-item-inner"),r.appendChild(s),r.classList.add("dummy-item"),t.parentNode.insertBefore(r,t),this.$controller.querySelector(".dummy-item-inner").style.height=this.draggingHeight+"px"},dummyItemCreateDragging:function(t,e){var i=document.createElement("div"),r=document.createElement("div");if(r.classList.add("dummy-item-inner"),i.appendChild(r),i.classList.add("dummy-item"),"T"===e){if(!t)return;if(null===t.previousElementSibling)return void this.insertDummyItem(e,i,t,this.draggingHeight);if(t.previousElementSibling.classList.contains("dummy-item"))return;this.insertDummyItem(e,i,t,this.draggingHeight)}if("B"===e){if(!t)return;if(null===t.nextElementSibling)return void this.insertDummyItem(e,i,t,this.draggingHeight);if(t.nextElementSibling.classList.contains("dummy-item"))return;this.insertDummyItem(e,i,t,this.draggingHeight)}},dummyItemCreateDragging2:function(t){var e=document.createElement("div"),i=document.createElement("div");i.classList.add("dummy-item-inner"),e.appendChild(i),e.classList.add("dummy-item"),t.firstElementChild||(this.dummyItemDelete(),t.appendChild(e),t.firstElementChild.firstElementChild.style.height=this.draggingHeight+"px")},insertDummyItem:function(t,e,i,r){"T"===t&&(this.dummyItemDelete(),i.parentNode.insertBefore(e,i),i.previousElementSibling.firstElementChild.style.height=r+"px"),"B"===t&&(this.dummyItemDelete(),i.parentNode.insertBefore(e,i.nextSibling),i.nextElementSibling.firstElementChild.style.height=r+"px")},dummyItemDelete:function(t){var e=this.$controller.querySelector(".dummy-item");e.parentNode.removeChild(e)},dragItemCreate:function(t){var e=document.createElement("div");e.classList.add("dragging-item"),e.appendChild(t.children[0]),this.$controller.appendChild(e),t.parentNode.removeChild(t)},dragItemStyleSet:function(t){t.style.left=this.dragPosLeft+"px",t.style.top=this.dragPosTop+"px",t.style.height=this.dragHeight+"px"},collision:function(t){for(var e=this.coords(this.draggingItem),i=[],r=[],s=[],n=[],a=0;a<this.$taskDetail.length;a++){var l=this.coords(this.$taskDetail[a]);if(this.overlaps(e,l)){var o={range:this.overlapsRange(e,l),count:a};i.push(o),s.push(o.range)}}for(var h=Math.max.apply(null,s),d=0;d<i.length;d++)if(i[d].range===h){var g=this.taskNum=i[d].count,c=this.$taskList[g].querySelectorAll(".task-list-item");if(0===c.length)this.dummyItemCreateDragging2(this.$taskList[g]);else{this.scrollY(g,e);for(var m=0;m<c.length;m++){var u=this.coords(c[m]),p=this.overlapsDirection(e,u),v=this.overlapsRange(e,u),y={direction:p,range:v,count:m};r.push(y),n.push(y.range)}for(var f=Math.max.apply(null,n),x=0;x<r.length;x++)r[x].range===f&&this.dummyItemCreateDragging(c[x],r[x].direction)}}},coords:function(t){var e=t.classList.contains("task-detail"),i=t.classList.contains("dragging-item"),r=t.clientWidth,s=t.clientHeight,n=e?t.parentNode.parentNode.scrollLeft:t.parentNode.parentNode.parentNode.parentNode.scrollLeft,a=t.parentNode.scrollTop,l=t.parentNode.parentNode.offsetLeft,o=i?0:133,h=t.offsetLeft+l-n,d=t.offsetTop+o-a,g=h+r,c=d+s,m=t.parentNode.offsetLeft+l-n,u=t.parentNode.offsetTop+o,p=m+t.parentNode.clientWidth,v=u+t.parentNode.clientHeight;return{x1:h,y1:d,x2:g,y2:c,ry1:Math.max(d,u),ry2:Math.min(c,v),ax1:m,ay1:u,ax2:p,ay2:v,cx:h+r/2,cy:d+s/2}},scrollX:function(){var t={x1:0,x2:$window.innerWidth},e=this.coords(this.draggingItem),i=this.locatingsX(e,t),r=this.$wallList;i.d?(clearInterval(this.timerX),this.timerX=setInterval(function(){var t=r.scrollLeft-i.p/50;r.scrollLeft=t},1)):clearInterval(this.timerX)},locatingsX:function(t,e){var i,r,s=!1,n=!1,a=e.x1-60-t.x1,l=e.x2-60-t.x2;return e.x1-60>=t.x1&&(s=!0),e.x2-60<=t.x2&&(n=!0),-a<l?(i=a,r=s):(i=l,r=n),{p:i,d:r}},scrollY:function(t,e){var i=this.coords(this.$taskDetail[t]),r=this.locatingsY(e,i),s=this.$taskList[t];r.d?(clearInterval(this.timerY),this.timerY=setInterval(function(){var t=s.scrollTop-r.p/50;s.scrollTop=t},1)):clearInterval(this.timerY)},locatingsY:function(t,e){var i,r,s=!1,n=!1,a=e.y1+100-t.y1,l=e.y2-160-t.y2;return e.y1+100>=t.y1&&(s=!0),e.y2-160<=t.y2&&(n=!0),-a<l?(i=a,r=s):(i=l,r=n),{p:i,d:r}},overlaps:function(t,e){var i=!1,r=!1;return(e.x1>=t.x1&&e.x1<=t.x2||e.x2>=t.x1&&e.x2<=t.x2||t.x1>=e.x1&&t.x2<=e.x2)&&(i=!0),(e.ry1>=t.y1&&e.ry1<=t.y2||e.ry2>=t.y1&&e.ry2<=t.y2||t.y1>=e.y1&&t.y2<=e.ry2)&&(r=!0),(e.y2<e.ay1||e.y1>e.ay2)&&(r=!1),i&&r},overlapsDirection:function(t,e){var i="";return t.cy<=e.cy&&(i="T"),t.cy>e.cy&&(i="B"),i},overlapsRange:function(t,e){var i=Math.max(t.x1,e.x1),r=Math.max(t.y1,e.y1);return(Math.min(t.x2,e.x2)-i)*(Math.min(t.y2,e.y2)-r)}},new dragAndDrop}();