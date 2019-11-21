import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Observable, of, BehaviorSubject, Subscription, from } from "rxjs";
import { map, filter, delay, mergeMap, debounceTime } from "rxjs/operators";
import axios from "axios";
const a$ = from([1, 2, 3, 4, 5]);

const search$ = new BehaviorSubject();
const searchPipe$ = search$.pipe(
  map(x => x),
  debounceTime(750),
  mergeMap(x => from(getPoke(x))),
  mergeMap(x => from(Promise.all(getPokeImage(x))))
);

// const addImages$= searchPipe$.pipe(map(_=>))

let helloadded$ = a$.pipe(
  filter(e => e < 5),
  mergeMap(e => of(e).pipe(delay(e * 300))),
  map(x => "Hello " + x)
);

// const getBIOS = async x => {
//   var o = [];
//   for (let i = 0; i < x; i++) {
//     o.push({ a: i });
//   }
//   return o.filter(x => true);
// };

const getPokeImage = x => {
  // use the poke detail api, each poke object will be a promise because we use async await.
  //  resolve all promise where invoked
  const wihtImg = x.map(async e => {
    const { name, url } = e;
    // console.log(url);
    const defaultImg = await axios
      .get(url)
      .then(res =>
        res.data.sprites.front_default ? res.data.sprites.front_default : "dd"
      );
    // console.log(defaultImg);

    return { name, defaultImg };
  });
  // console.log(wihtImg);
  return wihtImg;
};

const getPoke = async x => {
  // get the details of a pokemon based on the name aka filter
  const resp = await axios
    .get("https://pokeapi.co/api/v2/pokemon/?limit=3000")
    .then(x => x.data.results);
  // console.log(resp);
  return resp.filter(_ => _.name.startsWith(x));
};

const useObservable = (obs$, setter) => {
  useEffect(() => {
    const mysub = obs$.subscribe(x => {
      setter(x);
      // console.log(x);
    });
    return () => mysub.unsubscribe();
  }, [obs$, setter]);
};

function App() {
  useEffect(() => {
    document.title = "Rishi Poke";
  }, []);
  const [x, setX] = useState(1212);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useObservable(helloadded$, setX);
  // useObservable(search$, setSearch);
  useObservable(searchPipe$, setResults);

  return (
    <div className="App">
      {/* <div>{x}</div> */}

      <div className="box fc">
        <div className="title1 fr-sb">
          <h2>PokeMon - RxJs + React</h2>
        </div>
        <input
          type="text"
          onChange={e => {
            setSearch(e.target.value);
            search$.next(e.target.value);
          }}
          value={search}
          placeholder="type pokemon name"
        ></input>

        {results.map(x => (
          <div className="poke fc">
            <div class="pokerow fr-sb">
              <div>{x.name}</div>
              <div>
                <img src={x.defaultImg} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
