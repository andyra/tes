@extends('layout')

@section('content')
    <form method="POST">
        {{ csrf_field() }}

        <div class="card flush flat-bottom">
            <div class="head">
                <h1>Which Collection would you like to export?</h1>

                <div class="controls">
                    <div class="btn-group">
                        <button type="submit" class="btn btn-primary">
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <input type="hidden"
                   name="selectedcollection"
                   v-model="$refs.handle.data">
            <collections-fieldtype
                    :config="{
                    type: 'collections',
                    max_items: 1,
                    required: true
                }"
                    name="handle"
                    v-ref:handle
            ></collections-fieldtype>
        </div>
    </form>
@endsection
