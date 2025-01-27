import { Renderer, BatchRenderer, Texture } from '@pixi/core';
import { Graphics, GRAPHICS_CURVES, FillStyle, LineStyle, graphicsUtils, GraphicsGeometry, LINE_CAP } from '@pixi/graphics';
const { FILL_COMMANDS, buildLine } = graphicsUtils;

import { BLEND_MODES } from '@pixi/constants';
import { Point, Matrix, SHAPES, Polygon } from '@pixi/math';
import { skipHello } from '@pixi/utils';
import sinon from 'sinon';
import { expect } from 'chai';

Renderer.registerPlugin('batch', BatchRenderer);

skipHello();

describe('Graphics', () =>
{
    describe('constructor', () =>
    {
        it('should set defaults', () =>
        {
            const graphics = new Graphics();

            expect(graphics.fill.color).to.be.equals(0xFFFFFF);
            expect(graphics.fill.alpha).to.be.equals(1);
            expect(graphics.line.width).to.be.equals(0);
            expect(graphics.line.color).to.be.equals(0);
            expect(graphics.tint).to.be.equals(0xFFFFFF);
            expect(graphics.blendMode).to.be.equals(BLEND_MODES.NORMAL);
        });
    });

    describe('lineStyle', () =>
    {
        it('should support a list of parameters', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(1, 0xff0000, 0.5, 1, true);

            expect(graphics.line.width).to.equal(1);
            expect(graphics.line.color).to.equal(0xff0000);
            expect(graphics.line.alignment).to.equal(1);
            expect(graphics.line.alpha).to.equal(0.5);
            expect(graphics.line.native).to.equal(true);

            graphics.destroy();
        });

        it('should default color to black if texture not present and white if present', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(1);
            expect(graphics.line.color).to.equal(0x0);
            graphics.lineTextureStyle({ texture: Texture.WHITE, width: 1 });
            expect(graphics.line.color).to.equal(0xFFFFFF);
            graphics.destroy();
        });

        it('should support object parameter', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({
                width: 1,
                alpha: 0.5,
                color: 0xff0000,
                alignment: 1,
                native: true,
            });

            expect(graphics.line.width).to.equal(1);
            expect(graphics.line.color).to.equal(0xff0000);
            expect(graphics.line.alignment).to.equal(1);
            expect(graphics.line.alpha).to.equal(0.5);
            expect(graphics.line.native).to.equal(true);
            expect(graphics.line.visible).to.equal(true);

            graphics.lineStyle();

            expect(graphics.line.width).to.equal(0);
            expect(graphics.line.color).to.equal(0);
            expect(graphics.line.alignment).to.equal(0.5);
            expect(graphics.line.alpha).to.equal(1);
            expect(graphics.line.native).to.equal(false);
            expect(graphics.line.visible).to.equal(false);

            graphics.destroy();
        });
    });

    describe('lineTextureStyle', () =>
    {
        it('should support object parameter', () =>
        {
            const graphics = new Graphics();
            const matrix = new Matrix();
            const texture = Texture.WHITE;

            graphics.lineTextureStyle({
                width: 1,
                alpha: 0.5,
                color: 0xff0000,
                matrix,
                texture,
                alignment: 1,
                native: true,
            });

            expect(graphics.line.width).to.equal(1);
            expect(graphics.line.texture).to.equal(texture);
            expect(graphics.line.matrix).to.be.ok;
            expect(graphics.line.color).to.equal(0xff0000);
            expect(graphics.line.alignment).to.equal(1);
            expect(graphics.line.alpha).to.equal(0.5);
            expect(graphics.line.native).to.equal(true);
            expect(graphics.line.visible).to.equal(true);

            graphics.lineTextureStyle();

            expect(graphics.line.width).to.equal(0);
            expect(graphics.line.texture).to.equal(Texture.WHITE);
            expect(graphics.line.matrix).to.equal(null);
            expect(graphics.line.color).to.equal(0);
            expect(graphics.line.alignment).to.equal(0.5);
            expect(graphics.line.alpha).to.equal(1);
            expect(graphics.line.native).to.equal(false);
            expect(graphics.line.visible).to.equal(false);

            graphics.destroy();
        });
    });

    describe('beginTextureFill', () =>
    {
        it('should pass texture to batches', () =>
        {
            const graphics = new Graphics();
            const canvas1 = document.createElement('canvas');
            const validTex1 = Texture.from(canvas1);
            const canvas2 = document.createElement('canvas');
            const validTex2 = Texture.from(canvas2);

            canvas1.width = 10;
            canvas1.height = 10;
            canvas2.width = 10;
            canvas2.height = 10;
            validTex1.update();
            validTex2.update();

            graphics.beginTextureFill({ texture: validTex1 });
            graphics.drawRect(0, 0, 10, 10);
            graphics.beginTextureFill({ texture: validTex2 });
            graphics.drawRect(20, 20, 10, 10);

            graphics.geometry.updateBatches();

            const batches = graphics.geometry.batches;

            expect(batches.length).to.equal(2);
            expect(batches[0].style.texture).to.equal(validTex1);
            expect(batches[1].style.texture).to.equal(validTex2);
        });
    });

    describe('utils', () =>
    {
        it('FILL_COMMADS should be filled', () =>
        {
            expect(FILL_COMMANDS).to.not.be.null;

            expect(FILL_COMMANDS[SHAPES.POLY]).to.not.be.null;
            expect(FILL_COMMANDS[SHAPES.CIRC]).to.not.be.null;
            expect(FILL_COMMANDS[SHAPES.ELIP]).to.not.be.null;
            expect(FILL_COMMANDS[SHAPES.RECT]).to.not.be.null;
            expect(FILL_COMMANDS[SHAPES.RREC]).to.not.be.null;
        });

        it('buildLine should execute without throws', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ width: 2, color: 0xff0000 });
            graphics.drawRect(0, 0, 10, 10);

            const geometry = graphics.geometry;
            const data = geometry.graphicsData[0];

            // native = false
            expect(() => { buildLine(data, geometry); }).to.not.throw();

            data.lineStyle.native = true;
            // native = true
            expect(() => { buildLine(data, geometry); }).to.not.throw();
        });
    });

    describe('lineTo', () =>
    {
        it('should return correct bounds - north', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);

            expect(graphics.width).to.be.closeTo(1, 0.0001);
            expect(graphics.height).to.be.closeTo(11, 0.0001);
        });

        it('should return correct bounds - south', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.lineTo(0, -10);

            expect(graphics.width).to.be.closeTo(1, 0.0001);
            expect(graphics.height).to.be.closeTo(11, 0.0001);
        });

        it('should return correct bounds - east', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.lineTo(10, 0);

            expect(graphics.height).to.be.closeTo(1, 0.0001);
            expect(graphics.width).to.be.closeTo(11, 0.0001);
        });

        it('should return correct bounds - west', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.lineTo(-10, 0);

            expect(graphics.height).to.be.closeTo(1, 0.0001);
            expect(graphics.width).to.be.closeTo(11, 0.0001);
        });

        it('should return correct bounds when stacked with circle', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0xFF0000);
            graphics.drawCircle(50, 50, 50);
            graphics.endFill();

            expect(graphics.width).to.be.equals(100);
            expect(graphics.height).to.be.equals(100);

            graphics.lineStyle(20, 0);
            graphics.moveTo(25, 50);
            graphics.lineTo(75, 50);

            expect(graphics.width).to.be.equals(100);
            expect(graphics.height).to.be.equals(100);
        });

        it('should return correct bounds when square', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(20, 0, 0.5);
            graphics.moveTo(0, 0);
            graphics.lineTo(50, 0);
            graphics.lineTo(50, 50);
            graphics.lineTo(0, 50);
            graphics.lineTo(0, 0);

            expect(graphics.width).to.be.equals(70);
            expect(graphics.height).to.be.equals(70);
        });

        it('should ignore duplicate calls', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(10, 0);

            expect(graphics.currentPath.points).to.deep.equal([0, 0, 10, 0]);
        });
    });

    describe('containsPoint', () =>
    {
        it('should return true when point inside a standard shape', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside a standard shape', () =>
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.false;
        });

        it('should return true when point inside just lines', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);
            graphics.lineTo(10, 10);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);
            graphics.closePath();

            expect(graphics.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside just lines', () =>
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);
            graphics.lineTo(10, 10);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);
            graphics.closePath();

            expect(graphics.containsPoint(point)).to.be.false;
        });

        it('should return false when no fill', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.false;
        });

        it('should return false with hole', () =>
        {
            const point1 = new Point(1, 1);
            const point2 = new Point(5, 5);
            const graphics = new Graphics();

            graphics.beginFill(0)
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .beginHole()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .endHole();

            expect(graphics.containsPoint(point1)).to.be.true;
            expect(graphics.containsPoint(point2)).to.be.false;
        });

        it('should handle extra shapes in holes', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0)
                .moveTo(3, 3)
                .lineTo(5, 3)
                .lineTo(5, 5)
                .lineTo(3, 5)
                .beginFill(0)
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .beginHole()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .endHole()
                .beginFill(0)
                .moveTo(5, 5)
                .lineTo(7, 5)
                .lineTo(7, 7)
                .lineTo(5, 7)
                .endFill();

            expect(graphics.containsPoint(new Point(1, 1))).to.be.true;
            expect(graphics.containsPoint(new Point(4, 4))).to.be.true;
            expect(graphics.containsPoint(new Point(4, 6))).to.be.false;
            expect(graphics.containsPoint(new Point(6, 4))).to.be.false;
            expect(graphics.containsPoint(new Point(6, 6))).to.be.true;
        });

        it('should take a matrix into account', () =>
        {
            const g = new Graphics();
            const m = new Matrix();

            g.beginFill(0xffffff, 1.0);
            m.identity().translate(0, 100);
            g.setMatrix(m.clone());
            g.drawRect(0, 0, 10, 10);
            m.identity().translate(200, 0);
            g.setMatrix(m.clone());
            g.drawRect(0, 0, 10, 10);
            g.setMatrix(null);
            g.drawRect(30, 40, 10, 10);

            expect(g.containsPoint(new Point(5, 5))).to.be.false;
            expect(g.containsPoint(new Point(5, 105))).to.be.true;
            expect(g.containsPoint(new Point(205, 5))).to.be.true;
            expect(g.containsPoint(new Point(35, 45))).to.be.true;
        });
    });

    describe('chaining', () =>
    {
        it('should chain draw commands', () =>
        {
            // complex drawing #1: draw triangle, rounder rect and an arc (issue #3433)
            const graphics = new Graphics().beginFill(0xFF3300)
                .lineStyle(4, 0xffd900, 1)
                .moveTo(50, 50)
                .lineTo(250, 50)
                .endFill()
                .drawRoundedRect(150, 450, 300, 100, 15)
                .beginHole()
                .endHole()
                .quadraticCurveTo(1, 1, 1, 1)
                .bezierCurveTo(1, 1, 1, 1, 1, 1)
                .arcTo(1, 1, 1, 1, 1)
                .arc(1, 1, 1, 1, 1, false)
                .drawRect(1, 1, 1, 1)
                .drawRoundedRect(1, 1, 1, 1, 0.1)
                .drawCircle(1, 1, 20)
                .drawEllipse(1, 1, 1, 1)
                .drawPolygon([1, 1, 1, 1, 1, 1])
                .clear();

            expect(graphics).to.be.not.null;
        });
    });

    describe('drawPolygon', () =>
    {
        let numbers: number[];
        let points: Point[];
        let poly: Polygon;

        before(() =>
        {
            numbers = [0, 0, 10, 10, 20, 20];
            points = [new Point(0, 0), new Point(10, 10), new Point(20, 20)];
            poly = new Polygon(points);
        });

        it('should support polygon argument', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.drawPolygon(poly);

            expect(graphics.geometry.graphicsData[0]).to.be.not.null;

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).to.deep.equals(numbers);
        });

        it('should support array of numbers', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.drawPolygon(numbers);

            expect(graphics.geometry.graphicsData[0]).to.be.not.null;

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).to.deep.equals(numbers);
        });

        it('should support array of points', () =>
        {
            const graphics = new Graphics();

            graphics.drawPolygon(points);

            expect(graphics.geometry.graphicsData[0]).to.be.not.null;

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).to.deep.equals(numbers);
        });

        it('should support flat arguments of numbers', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.drawPolygon(...numbers);

            expect(graphics.geometry.graphicsData[0]).to.be.not.null;

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).to.deep.equals(numbers);
        });

        it('should support flat arguments of points', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.drawPolygon(...points);

            expect(graphics.geometry.graphicsData[0]).to.be.not.null;

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).to.deep.equals(numbers);
        });
    });

    describe('drawing same rectangle with drawPolygon and drawRect', () =>
    {
        let width: number;
        let height: number;
        let points: Point[];

        before(() =>
        {
            width = 100;
            height = 100;
            points = [
                new Point(0, 0),
                new Point(width, 0),
                new Point(width, height),
                new Point(0, height)
            ];
        });

        it('should have the same bounds for any line alignment value', () =>
        {
            const polyGraphics = new Graphics();
            const rectGraphics = new Graphics();

            const lineWidth = 10;
            const lineAlignments = [0, 0.2, 0.5, 1];

            lineAlignments.forEach((lineAlignment) =>
            {
                polyGraphics.clear();
                rectGraphics.clear();

                polyGraphics.beginFill(0x0000ff);
                polyGraphics.lineStyle(lineWidth, 0xff0000, 1, lineAlignment);
                polyGraphics.drawPolygon(points);
                polyGraphics.endFill();

                rectGraphics.beginFill(0x0000ff);
                rectGraphics.lineStyle(lineWidth, 0xff0000, 1, lineAlignment);
                rectGraphics.drawRect(0, 0, width, height);
                rectGraphics.endFill();

                const polyBounds = polyGraphics.getBounds();
                const rectBounds = rectGraphics.getBounds();

                expect(polyBounds.x).to.equal(rectBounds.x);
                expect(polyBounds.y).to.equal(rectBounds.y);
                expect(polyBounds.width).to.equal(rectBounds.width);
                expect(polyBounds.height).to.equal(rectBounds.height);
            });
        });
    });

    describe('arc', () =>
    {
        it('should draw an arc', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            expect(() => graphics.arc(100, 30, 20, 0, Math.PI)).to.not.throw();

            expect(graphics.currentPath).to.be.not.null;
        });

        it('should not throw with other shapes', () =>
        {
            // complex drawing #1: draw triangle, rounder rect and an arc (issue #3433)
            const graphics = new Graphics();

            // set a fill and line style
            graphics.beginFill(0xFF3300);
            graphics.lineStyle(4, 0xffd900, 1);

            // draw a shape
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);
            graphics.endFill();

            graphics.lineStyle(2, 0xFF00FF, 1);
            graphics.beginFill(0xFF00BB, 0.25);
            graphics.drawRoundedRect(150, 450, 300, 100, 15);
            graphics.endFill();

            graphics.beginFill();
            graphics.lineStyle(4, 0x00ff00, 1);

            expect(() => graphics.arc(300, 100, 20, 0, Math.PI)).to.not.throw();
        });

        it('should do nothing when startAngle and endAngle are equal', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.arc(0, 0, 10, 0, 0);

            expect(graphics.currentPath).to.be.null;
        });

        it('should do nothing if sweep equals zero', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.arc(0, 0, 10, 10, 10);

            expect(graphics.currentPath).to.be.null;
        });
    });

    describe('_calculateBounds', () =>
    {
        it('should only call updateLocalBounds once when not empty', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill();
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();

            const spy = sinon.spy(graphics.geometry, 'calculateBounds' as keyof GraphicsGeometry);

            graphics['_calculateBounds']();

            expect(spy).to.have.been.calledOnce;

            graphics['_calculateBounds']();

            expect(spy).to.have.been.calledOnce;
        });

        it('should not call updateLocalBounds when empty', () =>
        {
            const graphics = new Graphics();

            const spy = sinon.spy(graphics.geometry, 'calculateBounds' as keyof GraphicsGeometry);

            graphics['_calculateBounds']();

            expect(spy).to.not.have.been.called;

            graphics['_calculateBounds']();

            expect(spy).to.not.have.been.called;
        });
    });

    describe('getBounds', () =>
    {
        it('should use getBounds without stroke', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0x0).drawRect(10, 20, 100, 200);

            const { x, y, width, height } = graphics.getBounds();

            expect(x).to.equal(10);
            expect(y).to.equal(20);
            expect(width).to.equal(100);
            expect(height).to.equal(200);
        });

        it('should use getBounds with stroke', () =>
        {
            const graphics = new Graphics();

            graphics
                .lineStyle(4, 0xff0000)
                .beginFill(0x0)
                .drawRect(10, 20, 100, 200);

            const { x, y, width, height } = graphics.getBounds();

            expect(x).to.equal(8);
            expect(y).to.equal(18);
            expect(width).to.equal(104);
            expect(height).to.equal(204);
        });

        it('should be zero for empty Graphics', () =>
        {
            const graphics = new Graphics();

            const { x, y, width, height } = graphics.getBounds();

            expect(x).to.equal(0);
            expect(y).to.equal(0);
            expect(width).to.equal(0);
            expect(height).to.equal(0);
        });

        it('should be zero after clear', () =>
        {
            const graphics = new Graphics();

            graphics
                .lineStyle(4, 0xff0000)
                .beginFill(0x0)
                .drawRect(10, 20, 100, 200)
                .clear();

            const { x, y, width, height } = graphics.getBounds();

            expect(x).to.equal(0);
            expect(y).to.equal(0);
            expect(width).to.equal(0);
            expect(height).to.equal(0);
        });

        it('should be equal of childs bounds when empty', () =>
        {
            const graphics = new Graphics();
            const child = new Graphics();

            child
                .beginFill(0x0)
                .drawRect(10, 20, 100, 200);

            graphics.addChild(child);

            const { x, y, width, height } = graphics.getBounds();

            expect(x).to.equal(10);
            expect(y).to.equal(20);
            expect(width).to.equal(100);
            expect(height).to.equal(200);
        });
    });

    describe('startPoly', () =>
    {
        it('should fill two triangles', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0xffffff, 1.0);
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);

            graphics.moveTo(250, 50);
            graphics.lineTo(450, 50);
            graphics.lineTo(300, 100);
            graphics.lineTo(250, 50);
            graphics.endFill();

            const data = graphics.geometry.graphicsData;

            expect(data.length).to.equals(2);
            expect((data[0].shape as Polygon).points).to.eql([50, 50, 250, 50, 100, 100, 50, 50]);
            expect((data[1].shape as Polygon).points).to.eql([250, 50, 450, 50, 300, 100, 250, 50]);
        });

        it('should honor lineStyle break', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(1.0, 0xffffff);
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineStyle(2.0, 0xffffff);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);
            graphics.lineStyle(0.0);

            const data = graphics.geometry.graphicsData;

            expect(data.length).to.equals(2);
            expect((data[0].shape as Polygon).points).to.eql([50, 50, 250, 50]);
            expect((data[1].shape as Polygon).points).to.eql([250, 50, 100, 100, 50, 50]);
        });
    });

    describe('should support adaptive curves', () =>
    {
        const defMode = GRAPHICS_CURVES.adaptive;
        const defMaxLen = GRAPHICS_CURVES.maxLength;
        const myMaxLen = GRAPHICS_CURVES.maxLength = 1.0;
        const graphics = new Graphics();

        GRAPHICS_CURVES.adaptive = true;

        graphics.beginFill(0xffffff, 1.0);
        graphics.moveTo(610, 500);
        graphics.quadraticCurveTo(600, 510, 590, 500);
        graphics.endFill();

        const pointsLen = (graphics.geometry.graphicsData[0].shape as Polygon).points.length / 2;
        const arcLen = Math.PI / 2 * Math.sqrt(200);
        const estimate = Math.ceil(arcLen / myMaxLen) + 1;

        expect(pointsLen).to.be.closeTo(estimate, 2.0);

        GRAPHICS_CURVES.adaptive = defMode;
        GRAPHICS_CURVES.maxLength = defMaxLen;
    });

    describe('geometry', () =>
    {
        it('validateBatching should return false if any of textures is invalid', () =>
        {
            const graphics = new Graphics();
            const invalidTex = Texture.EMPTY;
            const validTex = Texture.WHITE;

            graphics.beginTextureFill({ texture: invalidTex });
            graphics.drawRect(0, 0, 10, 10);
            graphics.beginTextureFill({ texture: validTex });
            graphics.drawRect(0, 0, 10, 10);

            const geometry = graphics.geometry;

            expect(geometry['validateBatching']()).to.be.false;
        });

        it('validateBatching should return true if all textures is valid', () =>
        {
            const graphics = new Graphics();
            const validTex = Texture.WHITE;

            graphics.beginTextureFill({ texture: validTex });
            graphics.drawRect(0, 0, 10, 10);
            graphics.beginTextureFill({ texture: validTex });
            graphics.drawRect(0, 0, 10, 10);

            const geometry = graphics.geometry;

            expect(geometry['validateBatching']()).to.be.true;
        });

        it('should be batchable if graphicsData is empty', () =>
        {
            const graphics = new Graphics();
            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batchable).to.be.true;
        });

        it('_compareStyles should return true for identical styles', () =>
        {
            const graphics = new Graphics();
            const geometry = graphics.geometry;

            const first = new FillStyle();

            first.color = 0xff00ff;
            first.alpha = 0.1;
            first.visible = true;

            const second = first.clone();

            expect(geometry['_compareStyles'](first, second)).to.be.true;

            const firstLine = new LineStyle();

            firstLine.color = 0xff00ff;
            firstLine.native = false;
            firstLine.alignment = 1;

            const secondLine = firstLine.clone();

            expect(geometry['_compareStyles'](firstLine, secondLine)).to.be.true;
        });

        it('should be 1 batch for same styles', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0xff00ff, 0.5);
            graphics.drawRect(0, 0, 20, 20);
            graphics.drawRect(100, 0, 20, 20);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).to.have.lengthOf(1);
        });

        it('should be 2 batches for 2 different styles', () =>
        {
            const graphics = new Graphics();

            // first style
            graphics.beginFill(0xff00ff, 0.5);
            graphics.drawRect(0, 0, 20, 20);

            // second style
            graphics.beginFill(0x0, 0.5);
            graphics.drawRect(100, 0, 20, 20);

            // third shape with same style
            graphics.drawRect(0, 0, 20, 20);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).to.have.lengthOf(2);
        });

        it('should be 1 batch if fill and line are the same', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(10.0, 0x00ffff);
            graphics.beginFill(0x00ffff);
            graphics.drawRect(50, 50, 100, 100);
            graphics.drawRect(150, 150, 100, 100);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).to.have.lengthOf(1);
        });

        it('should not use fill if triangulation does nothing', () =>
        {
            const graphics = new Graphics();

            graphics
                .lineStyle(2, 0x00ff00)
                .beginFill(0xff0000)
                .drawRect(0, 0, 100, 100)
                .moveTo(200, 0)
                .lineTo(250, 200);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).to.have.lengthOf(2);
            expect(geometry.batches[0].style.color).to.equals(0xff0000);
            expect(geometry.batches[0].size).to.equal(6);
            expect(geometry.batches[1].style.color).to.equals(0x00ff00);
            expect(geometry.batches[1].size).to.equal(30);
        });
    });
});
