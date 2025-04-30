import React from "react";
import { Checkbox } from "../../components/Checkbox";
import "./style.css";
import {Button} from "../../components/Button/index.js";

export const StartNewSession = ({onClose}) => {
  return (
    <div className="start-new-session">
      <div className="div">
        <div className="overlap">
          <div className="text-wrapper-2">Session Tittle:</div>

          <div className="rectangle-2" />
        </div>

        <div className="text-wrapper-3">Sorting target 1:</div>

        <div className="text-t1-male">male</div>

        <div className="text-t1-female">female</div>

        <div className="text-t1-fl">fluorescent</div>

        <div className="text-t1-nfl">not fluorescent</div>

        <div className="text-wrapper-8">Sorting target 2:</div>

        <div className="text-t2-male">male</div>

        <div className="text-t2-female">female</div>

        <div className="text-t2-fl">fluorescent</div>

        <div className="text-t2-nfl">not fluorescent</div>

        <div className="overlap-group">
          <div className="text-wrapper-13">Limit sorting number:</div>

          <div className="rectangle-3" />
        </div>

        <div className="overlap-2">
          <p className="p">Choose available machines for this session:</p>

          <div className="group">
            <div className="overlap-group-2">
              <div className="text-choose-all">Choose All</div>

              <div className="rectangle-4" />

              <div className="rectangle-wrapper">
                <div className="rectangle-5" />
              </div>
              <Checkbox
                  className="checkbox-0"
                  rectangleClassName="design-component-0-node"
                  state="unchecked"
              />
              <Checkbox
                className="checkbox-2"
                rectangleClassName="checkbox-3"
                state="unchecked"
              />
              <Checkbox
                className="checkbox-4"
                rectangleClassName="checkbox-3"
                state="checked"
              />
              <div className="text-wrapper-15">Machine #</div>

              <div className="text-wrapper-16">Machine #</div>

              <Checkbox
                className="checkbox-5"
                rectangleClassName="checkbox-3"
                state="unchecked"
              />
              <div className="text-wrapper-17">Machine #</div>

              <Checkbox
                className="checkbox-6"
                rectangleClassName="checkbox-3"
                state="unchecked"
              />
              <div className="text-wrapper-18">Machine #</div>

              <Checkbox
                className="checkbox-7"
                rectangleClassName="checkbox-3"
                state="unchecked"
              />
              <div className="text-wrapper-19">Machine #</div>
            </div>
          </div>
        </div>

        <div className="text-wrapper-20">Description:</div>

        <div className="rectangle-6" />

        <Checkbox
          className="checkbox-t1-male"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
        <Checkbox
          className="checkbox-t1-fl"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
        <Checkbox
          className="checkbox-t1-female"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
        <Checkbox
          className="checkbox-t1-nfl"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
        <div className="ellipse" />

        <div className="ellipse-2" />

        <div className="ellipse-3" />
        <Button className="button-instance-1" onClick={onClose} />
        <Checkbox
          className="checkbox-t2-male"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
        <Checkbox
          className="checkbox-t2-fl"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
        <Checkbox
          className="checkbox-t2-female"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
        <Checkbox
          className="checkbox-t2-nfl"
          rectangleClassName="checkbox-9"
          state="unchecked"
        />
      </div>
    </div>
  );
};
