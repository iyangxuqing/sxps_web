let mouse = {}

let vm = new Vue({
	el: '#app',
	data:{
		cates: [],
		items: [],
		newParentCateTitle: '',
		newChildCateTitle: '',
		currentCateId: '',
		editedItemId: '',
		itemEditorShow: false,
		editedItem: {},
		itemEditor:{
			show: false,
			item: {},
		},
		contextmenu: {
			cate: {
				top: 0,
				left: 0,
				show: false,
			}
		},
		overlay:{
			show: false,
		},
	},
	mounted:function(){
		this.$nextTick(()=>{
			this.$http.get("https://yixing01.applinzi.com/sxps_seller/item2.php?m=get").then(res=>{
				let items = res.data.items
				for(let i in items){
					if(items[i].images=='') items[i].images = '[]';
					items[i].images = JSON.parse(items[i].images)
				}
				this.items = res.data.items
			})
			this.$http.get("https://yixing01.applinzi.com/sxps_seller/cate2.php?m=get").then(res=>{
				let cates = []
				for(let i in res.data.cates){
					let cate = res.data.cates[i]
					if(cate.pid==0){
						cates.push(cate)
					} else {
						for(let j in cates){
							if(cates[j].id == cate.pid){
								if(!cates[j].children) cates[j].children = [];
								cates[j].children.push(cate)
								break
							}
						}
					}
				}
				for(let i in cates){
					if(i==0){
						cates[i].active = true
					} else {
						cates[i].active = false	
					}
					for(let j in cates[i].children){
						if(j==0){
							cates[i].children[j].active = true
						} else {
							cates[i].children[j].active = false
						}
					}
				}
				this.cates = cates
				this.currentCateId = cates[0].children[0].id
			})	
		})
	},
	filters: {
		money:function(value){
			return "￥" + Number(value).toFixed(2)
		}
	},
	computed:{
		cateItems: function(){
			let cid = this.currentCateId
			let items = this.items
			let _items = []
			for(let i in items){
				if(items[i].cid==cid){
					_items.push(items[i])
				}
			}
			return _items
		}
	},
	methods: {
		onCateClick: function(cate){
			let cates = this.cates
			if(cate.pid==0){
				for(let i in cates){
					cates[i].active = false
					if(cates[i].id==cate.id) cates[i].active = true;
				}
			} else {
				for(let i in cates){
					if(cates[i].active==true){
						for(let j in cates[i].children){
							cates[i].children[j].active = false
							if(cates[i].children[j].id==cate.id) cates[i].children[j].active = true;
						}
					}
				}
			}
			for(let i in cates){
				if(cates[i].active == true){
					for(let j in cates[i].children){
						if(cates[i].children[j].active==true){
							this.currentCateId = cates[i].children[j].id
							break
						}
					}
				}
			}
		},

		onItemClick: function(item, e){
			if(mouse.longPressed){
				mouse.longPressed = false
				return
			}
			this.itemEditor.item = item
			this.itemEditor.show = true
			this.overlay.show = true
		},

		onItemEditorCancel: function(){
			this.itemEditor.show = false
			this.overlay.show = false
		},

		onItemEditorConfirm: function(item){
			console.log(item)
			this.itemEditor.show = false
			this.overlay.show = false
		},

		onOverlayClick: function(){
			this.overlay.show = false
			this.onItemEditorCancel()
		},

		onBodyClick: function(){
			console.log('onBodyClick')
			this.contextmenu.cate.show = false
		},

		onItemMouseDown(item, e){
			mouse.item = item
			mouse.itemStartTime = e.timeStamp
			mouse.itemTimer = setTimeout(()=>{
				mouse.longPressed = true
				this.editedItemId = item.id
			}, 1000)
		},

		onItemMouseUp(item, e){
			if(e.timeStamp - mouse.itemStartTime < 1000){
				clearTimeout(mouse.itemTimer)
				this.editedItemId = ''
			}
		},

		onEditorBtn(item, type){
			if(type=='onshelf'){
				item.onShelf = !item.onShelf
			}
		},

		onCateMouseUp(cate, e){
			if(e.button==2){
				console.log(e)
				this.contextmenu.cate.show = true
			}
		},

		onContextMenu(e){
			let id = e.target.dataset.id
			let pid = e.target.dataset.pid
			let type = e.target.dataset.type
			if(type=='cate'){
				let cate = {}
				if(pid==0){
					for(let i in this.cates){
						if(this.cates[i].id==id){
							cate = this.cates[i]
							break
						}
					}
				} else {
					for(let i in this.cates){
						if(this.cates[i].id==pid){
							for(let j in this.cates.children){
								if(this.cates.children[j].id==id){
									cate = this.cates.children[j]
									break
								}
							}
							break
						}
					}
				}
				let clientX = e.clientX
				let clientY = e.clientY
				this.contextmenu.cate.id = cate.id
				this.contextmenu.cate.pid = cate.pid
				this.contextmenu.cate.title = cate.title
				this.contextmenu.cate.top = clientY + 'px'
				this.contextmenu.cate.left = clientX + 'px'
				this.contextmenu.cate.show = true	
			}
		},

		onContextMenuClick(){
		},

		onAppClick(){
			this.contextmenu.cate.show = false
		}
	}

})