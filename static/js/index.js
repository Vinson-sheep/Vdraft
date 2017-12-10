// 定义全局工具
(function() {
    window.tool = {
        getTimeStr: getTimeStr
    };

    function getTimeStr(timeNum) { // 输入一个毫秒数，返回时间字符串
        var d = new Date(timeNum);
        var time = d.getFullYear() + '-'
            + d.getMonth() + '-'
            + d.getDay() + ' '
            + d.getHours() + ':'
            + d.getMinutes() + ':'
            + d.getMinutes();
        return time;
    }
})();

// vue实例
(function() {

    // markdown编辑器配置
    var md_config = {
        width: '100%',
        height: '100%',
        path: 'static/bower/editor.md/lib/'
    };

    // 创建一个md实例
    var editor;

    // ## 配置模块
    // 1. 侧栏
    var sidebarTem = {
        template: '#sidebar-tem',
        props: ['articles', 'list_order', 'article_index'],
        data: function() {
            return {
                showIndex: -1,
                abledIndex: -1,
                activeIndex: this.article_index,
                hide_bar: false
            }
        },
        mounted: function() {

        },
        methods: {
            showIndexTo: function(i) { // 更变showIndex
                // 重定向this
                var _this = this;
                // 修改showIndex
                _this.showIndex = i;
                // 定义事件处理器
                var hander_1 = function () {
                    _this.showIndex = -1;
                    document.removeEventListener('click', hander_1);
                };
                // 当点击文档其他部分就会重置showIndex
                document.addEventListener('click', hander_1);
            },
            abledIndexTo: function(i) { // 更变abledIndex
                var _this = this;
                _this.abledIndex = i;
                var hander_2 = function() {
                    _this.abledIndex = -1;
                    document.removeEventListener('click', hander_2);
                };
                document.addEventListener('click', hander_2);
                // 隐藏选项框
                _this.showIndex = -1;
                // 获得焦点
                setTimeout(function() {
                    $('#sortable input[type=text]')[i].focus();
                }, 50);
            },
            removeArticle: function(i) { // 删除文章
                this.articles = this.articles.splice(i,1);
            },
            changeArticle: function(i) { // 重新选择文章
                this.activeIndex = i;
                this.$emit('change_index', this.activeIndex);
            },
            addNewArticle: function() { // 新建文章
                // 名称name
                var name='';
                var i;
                // 搜索是否已经存在相同名称的文章,并给出合理名称
                for (i=0;i<this.articles.length;i++) {
                    // 按规则定一个a默认名称
                    var a = '未命名' + (i+1);
                    var exist = false;
                    // 遍历检测a是否有效
                    this.articles.forEach(function(article) {
                        if (article.title === a) {
                            exist = true;
                        }
                    });
                    // 如果a有效，则赋值给name
                    if (!exist) {
                        name = a;
                        // 终止循环
                        break;
                    }
                }
                // 设置默认值
                if (name ==='') {
                    name = '未命名' + (i+1);
                }

                // 编号id
                var id = Date.now();

                // 时间time
                var now = new Date(id);
                var time = window.tool.getTimeStr(now);
                // 空白对象
                var o = {
                    title: name,
                    id: id,
                    time: time,
                    content: ''
                };
                // 插入到数据中
                this.articles.unshift(o);
                // 重置activeIndex
                this.activeIndex = 0;
                // 反馈给root
                this.$emit('change_index', 0);
            },
            inputArticle: function(e) { // 导入文章
                // 封锁this
                var _this = this;
                // 获取文章对象
                var file = e.target.files[0];
                // 新建reader对象
                var reader = new FileReader();
                // 以字符串形式读取
                reader.readAsText(file);
                // 读取完成之后的动作
                reader.onload = function(f) {
                    var content = this.result;
                    var id = Date.now();
                    var time = window.tool.getTimeStr(id);
                    var o = {
                        title: file.name,
                        id: id,
                        time: time,
                        content: content
                    };
                    console.log(o);
                    // 添加到数组
                    // 插入到数据中
                    _this.articles.unshift(o);
                    // 重置activeIndex
                    _this.activeIndex = 0;
                    // 反馈给root
                    _this.$emit('change_index', 0);
                }
            },
            hideBar: function() { // 隐藏菜单栏
                this.hide_bar = true;
                $('#content').addClass('side-hide');
            },
            showBar: function() { // 显示菜单栏
                this.hide_bar = false;
                $('#content').removeClass('side-hide');
            },
            getTimeStr: function(timeNum) { // 输入一个毫秒数，返回时间字符串
                var d = new Date(timeNum);
                var time = d.getFullYear() + '-'
                    + d.getMonth() + '-'
                    + d.getDay() + ' '
                    + d.getHours() + ':'
                    + d.getMinutes() + ':'
                    + d.getMinutes();
                return time;
            }
        }
    };
    // 2. 文章信息
    var articleMsg = {
        template: '#article-message-tem',
        props: ['articles', 'article_index'],
        data: function() {
            return {

            }
        },
        computed: {
            articleIndex: function() {
                return this.article_index;
            },
            title: {
                get: function() {
                    return this.articles[this.article_index].title;
                },
                set: function(value) {
                    this.articles[this.article_index].content = value;
                }
            },
            time: function() {
                return this.articles[this.article_index].time;
            },
            count: function() {
                // 获取实际文章内容
                var content = this.articles[this.article_index].content;
                // 去除空格
                content = content.replace(' ','');
                // 获取长度
                var length = content.length;
                // 返回
                return length;
            }
        },
        methods: {
            changeRootTitle: function(value) {
                // 限制长度
                if (value.length>30) {
                    value = value.substring(0,30);
                    this.$refs.input.value = value;
                }
                this.articles[this.article_index].title = value;
            }
        }
    };
    // 3. md编辑器
    var markdownEditor = {
        template: '#markdown-editor-tem',
        props: ['articles', 'article_index'],
        data: function() {
            return {

            }
        },
        computed: {

        },
        watch: {
            article_index: function(new_v, old_v) {
                editor.setValue(this.articles[new_v].content);
            }
        },
        mounted: function() { // 初始化数据、两秒内更新顶层数据
            // 封装this
            var _this = this;
            // 设置间隔函数
            setInterval(function() {
                // 获取editor数据
                var content = editor.getValue();
                // 更新顶层数据
                _this.articles[_this.article_index].content = content;
            }, 2000);
        },
        methods: {

        }
    };

    // Vue实例
    var vm = new Vue({
        el: '#app',
        data: {

            list_order : ['全职高手', '从零开始的异世界生活', '宝石之国'],
            articles: [
                {
                    title: '全职高手',
                    id: '1234567891',
                    time: '2017-12-1',
                    content: '该小说讲述了网游顶尖高手叶修，遭到俱乐部的驱逐，而后在荣耀新开的第十区重新投入了游戏，召集一群志同道合的伙伴，重返巅峰之路的故事。'
                },
                {
                    title: '从零开始的异世界生活',
                    id: '1234567892',
                    time: '2017-12-2',
                    content: '在从便利商店回家的路上，突然被异世界召唤的少年菜月昴。在无法依靠任何东西的异世界，无力的少年手唯一的力量……那是“死去然后重新开始”的力量。为了守护最重要的人们，为了取回确实存在着又无可替代的时间，少年抗拒着绝望，勇敢地面对着残酷的命运.'
                },
                {
                    title: '宝石之国',
                    id: '1234567893',
                    time: '2017-12-3',
                    content: '宝石中最年少的磷叶石，仅有3.5的脆弱硬度，韧性也很弱，因而不适于战斗。此外，也没有对其他工作的适应性。被看做是只会出一张嘴，完完全全的吊车尾。这样的磷叶石，在即将满三百岁时终于被交付了第一件工作。'
                }
            ],
            articleIndex: 0 // 默认选择第一篇文章

        },
        mounted: function() {
            var _this = this;
            // 可排序列表初始化
            $( "#sortable" ).sortable();
            $( "#sortable" ).disableSelection();
            // md编辑器初始化
            editor = editormd("markdown-container", md_config);
            // 初始化内容
            setTimeout(function(){
                editor.setValue(_this.articles[_this.articleIndex].content);
            }, 300);
        },
        methods: {
            changeIndex: function(index) {
                this.articleIndex = index;
            }
        },
        components: {
            'my-sidebar': sidebarTem,
            'article-message': articleMsg,
            'markdown-editor': markdownEditor
        }
    });

})();