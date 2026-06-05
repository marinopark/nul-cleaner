export namespace main {
	
	export class DeleteResult {
	    deleted: number;
	    failed: number;
	    bytesFreed: number;
	    errors: string[];
	
	    static createFrom(source: any = {}) {
	        return new DeleteResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.deleted = source["deleted"];
	        this.failed = source["failed"];
	        this.bytesFreed = source["bytesFreed"];
	        this.errors = source["errors"];
	    }
	}
	export class FileEntry {
	    path: string;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new FileEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.size = source["size"];
	    }
	}

}

