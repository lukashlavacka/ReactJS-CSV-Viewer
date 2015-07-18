var Table = React.createClass({
	render: function() {
		return (
			<BootstrapRow>			
				<p className="info">Found {this.props.filteredCount || 0} record(s)</p>
				<div className="table-responsive">
					<table className="table table-striped table-hover">
						<Head columns={this.props.columns} handleSortChange={this.props.handleSortChange} />
						<Body displayData={this.props.displayData} columns={this.props.columns} />			
					</table>
				</div>
			</BootstrapRow>
		);
	}
})

var Head = React.createClass({
	handleSortChange: function(column, event) {
		event.preventDefault();
		this.props.handleSortChange(column)	
	},
	render: function() {
		return (
			<thead>
				<tr>
					{this.props.columns.map(function(column){
						return <th key={column}><a href="#" onClick={this.handleSortChange.bind(null, column)}>{column}</a></th>
					}.bind(this))}
				</tr>
			</thead>
		);
	}
})

var Body = React.createClass({
	render: function() {
		return (
			<tbody>
				{this.props.displayData.map(function(r){
					return <Row data={r} columns={this.props.columns} />
				}.bind(this))}
			</tbody>
		);
	}
})

var Row = React.createClass({
	render: function() {
		return (
			<tr>
				{this.props.columns.map(function(h){
					return <td key={h}>{ this.props.data[h] }</td>
				}.bind(this))}			
			</tr>
		);
	}
})

var BootstrapRow = React.createClass({
	render: function() {
		return (
			<div className="row">
				<div className="col-xs-12">
					{this.props.children}
				</div>
			</div>
		);
	}
})

var CSVInput = React.createClass({
	handleChange: function(e){
		var file = React.findDOMNode(this.refs.csv).files[0];
		if(!file)
			return;

		this.props.handleFileChange(file);
	},
	render: function() {
		return (
			<BootstrapRow>
				<form className="form-inline">
					<div className="form-group">
						<label htmlFor="file">CSV File</label>
						<input type="file" className="form-control" id="file" accept=".csv" onChange={this.handleChange} ref="csv" />
					</div>
				</form>			
			</BootstrapRow>
		);
	}
})

var GenericFilter = React.createClass({
	handleChange: function(event)
	{
		var filterValue = React.findDOMNode(this.refs.filterValue).value
		var filterColumn = React.findDOMNode(this.refs.filterColumn).value
		if(!filterValue || !filterColumn)
			return;

		this.props.handleFilterChange(filterColumn, filterValue);
	},
	render: function() {
		return (
			<BootstrapRow>
				<form className="form-inline">
					<div className="form-group">
						<label htmlFor="filterColumn">Filter Value</label>
						<select className="form-control" id="filterColumn" onChange={this.handleChange} ref="filterColumn">
							<option value="">Select column</option>
							{this.props.columns.map(function(c){
								return <option key={c} value={c}>{c}</option>
							})}
						</select>
					</div>
						<div className="form-group">
						<label htmlFor="filterValue">Filter Value</label>
						<input type="text" className="form-control" id="filterValue" onChange={this.handleChange} ref="filterValue" />
					</div>
				</form>
			</BootstrapRow>
		);
	}
})

var Pager = React.createClass({
	handlePaginationChange: function(page, event) {
		event.preventDefault();
		this.props.handlePaginationChange(page)	
	},
	render: function() {
		if(this.props.filteredCount < 50)
			return null;

		var currentPage = this.props.page;

		var showPages = 9
		var showPagesHalf = Math.floor(showPages / 2.0);
		var totalPages = Math.ceil(this.props.filteredCount / 50.0)
		var startIndex = Math.max(0, (currentPage > (totalPages - showPagesHalf) ? (totalPages - showPages) : (currentPage - showPagesHalf)));

		var pages = []
		var i = startIndex;
		for (; pages.length < Math.min(showPages, totalPages); i++) {
			pages.push({display : i + 1, page : i})
		}

		if(startIndex > 0)
			pages.unshift({display: "...", page: Math.ceil(startIndex / 2.0) })
		if(i < totalPages)
			pages.push({display: "...", page: Math.floor(i + ((totalPages - i) / 2.0))})
		return (
			<BootstrapRow>
				<nav>
					<ul className="pagination">
						<li>
							<a href="#" onClick={this.handlePaginationChange.bind(null, 0)}>First</a>
						</li>
						<li>
							<a href="#" aria-label="Previous" onClick={this.handlePaginationChange.bind(null, "-1")}>
								<span aria-hidden="true">&laquo;</span>
							</a>
						</li>
						{pages.map(function(i){
							var active = currentPage == i.page ? "active" : null;				
							return <li className={active} key={i.page}><a href="#" onClick={this.handlePaginationChange.bind(this, i.page)}>{i.display}</a></li>
						}.bind(this))}
						<li>
							<a href="#" aria-label="Next" onClick={this.handlePaginationChange.bind(null, "+1")}>
								<span aria-hidden="true">&raquo;</span>
							</a>
						</li>
						<li>
							<a href="#" onClick={this.handlePaginationChange.bind(null, totalPages - 1)}>Last</a>
						</li>
					</ul>
				</nav>
			</BootstrapRow>
		);
	}
})

var Wrapper = React.createClass({
	onDragEnter : function(event) {
		event.stopPropagation();
		event.preventDefault();
	},
	onDragOver : function(event) {
		event.stopPropagation();
		event.preventDefault();
	},
	onDrop: function(event){
		event.stopPropagation();
		event.preventDefault();

		var dt = event.dataTransfer;
		var files = dt.files;

		if(files && files.length && files[0])
			this.props.handleFileChange(files[0]);
	},
	render: function() {
		return (
			<div style={{ height: "100%" }} onDrop={this.onDrop} onDragEnter={this.onDragEnter} onDragOver={this.onDragOver}>
				{this.props.children}
			</div>
		);
	}
})

var Interface = React.createClass({
	getFileSelectState: function(data, state)
	{
		state.data = data.data;
		state.columns = data.meta.fields;
		state.totalCount = data.data.length;

		return this.getFilterChangeState(null, null, state);
	},
	getFilterChangeState: function(column, value, fileState)
	{
		if(column && value)
		{
			var loweredFilter = value.toLowerCase();
			var filtered = fileState.data.filter(function(d){

				return d[column] && d[column].toString().toLowerCase().indexOf(loweredFilter) > -1
			});
			fileState.filteredData = filtered;
			fileState.filteredCount = filtered.length;
		}
		else	
		{
			fileState.filteredData = fileState.data;
			fileState.filteredCount = fileState.totalCount;
		}

		return this.getSortChangeState(null, fileState);
	},
	getSortChangeState: function(col, filterState)
	{
		if(!col)
		{
			col = filterState.sort.slice(1);
			var desc = filterState.sort[0] == "-";
		}
		else
		{
			var desc = filterState.sort.slice(1) == col && filterState.sort[0] != "-";		
		}

		filterState.sortedData = filterState.filteredData.sort(function(a, b) {
			return a[col] == b[col] ? 0 : (a[col] < b[col] ? -1 : 1) * (desc ? -1 : 1);
		});
		filterState.sort = (desc ? "-" : "+") + col;


		return this.getPaginationChangeState(0, filterState);
	},
	getPaginationChangeState: function(page, sortState)
	{
		if(typeof page === "string")
		{
			if(page === "-1" && this.state.page > 0)
				page = sortState.page - 1;
			else if(page === "+1" && sortState.page < Math.floor(sortState.filteredCount / 50))
				page = sortState.page + 1;
			else
				page = sortState.page;
		}

		sortState.page = page;
		sortState.displayData = sortState.sortedData.slice(page * 50, (page + 1) * 50);
		return sortState;
	},
	handleDrop: function(event)
	{
		event.preventDefault();
	},
	handleFileChange: function(file)
	{
		Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			complete: this.handleDataChange
		});
	},
	handleDataChange: function(data){
		this.setState(this.getFileSelectState(data, this.state));
	},
	handleFilterChange: function(column, value){
		this.setState(this.getFilterChangeState(column, value, this.state));
	},
	handleSortChange: function(col) {
		this.setState(this.getSortChangeState(col, this.state));
	},
	handlePaginationChange: function(page){
		this.setState(this.getPaginationChangeState(page, this.state));
	},
	getInitialState: function() {
		return {
			data: [],
			filteredData: [],
			sortedData: [],
			displayData: [],
			columns: [],
			totalCount: 0,
			filteredCount: 0,
			page: 0,
			sort: "+yearID"
		}
	},
	render: function() {
		return (
			<Wrapper handleFileChange={this.handleFileChange}>
				<CSVInput handleFileChange={this.handleFileChange} data={this.state.data} />
				<GenericFilter handleFilterChange={this.handleFilterChange} columns={this.state.columns}/>
				<Table displayData={this.state.displayData} columns={this.state.columns} handleSortChange={this.handleSortChange} filteredCount={this.state.filteredCount} />
				<Pager filteredCount={this.state.filteredCount} page={this.state.page} handlePaginationChange={this.handlePaginationChange} />
			</Wrapper>
		);
	}
})

React.render(
	<Interface />,
	document.getElementById('content')
	);