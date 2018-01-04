let mouse = {}

let vm = new Vue({
	el: '#app',
	data:{
		cates: [],
		items: [],
		trades: [],
		search:{
			input: '',
			value: '',
		},
		currentCateId: '',
		editedItem: {},
		itemEditor:{
			show: false,
			item: {},
		},
		overlay:{
			show: false,
		},
	},
	mounted:function(){
		this.$nextTick(()=>{
			this.$http.get("https://yixing01.applinzi.com/sxps_seller/trade2.php?m=get").then(res=>{
				let trades = res.data.trades
				for(let i in trades){
					let num = 0
					let amount = 0
					let realNum = 0
					let realAmount = 0
					for(let j in trades[i].orders){
						let order = trades[i].orders[j]
						num = num + Number(order.num)
						amount = amount + order.num * order.price
						realNum = realNum + Number(order.realNum)
						realAmount = realAmount + order.realNum * order.price
					}
					trades[i].num = num
					trades[i].amount = amount
					trades[i].realNum = realNum
					trades[i].realAmount = realAmount
				}
				this.trades = trades
				console.log(trades)
			})
		})
	},
	filters: {
		money: function(value){
			return "￥" + Number(value).toFixed(2)
		},
		number: function(value){
			if(String(value).indexOf('.')>-1){
				return Number(value).toFixed(2)
			} else {
				return value
			}
		}
	},
	computed:{
		listItems: function(){
			let search = this.search.value
			let cid = this.currentCateId
			let items = this.items
			let _items = []
			if(search){
				for(let i in items){
					if(items[i].title.indexOf(search)>-1){
						_items.push(items[i])
					}
				}
			} else {
				for(let i in items){
					if(items[i].cid==cid){
						_items.push(items[i])
					}
				}
			}
			return _items
		}
	},
	methods: {
		onSearchCancel: function(e){
			this.search.input = ''
			this.search.value = ''
		},
		onSearch:function(){
			this.search.value = this.search.input
			console.log('onSearch', this.search.value)
		},

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

		onNewCateBlur: function(e){
			let pid = e.target.dataset.pid
			let value = e.target.value
			console.log(pid, value)
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