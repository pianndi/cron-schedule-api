import cronstrue from "cronstrue"
import 'cronstrue/locales/id.min.js'


class MiscController {
  translate(req, res) {
    const { expression } = req.body;
    if (!expression) return res.status(401).json({ message: 'Input tidak valid' });
    try {
      const translated = cronstrue.toString(expression, { locale: 'id' });
      return res.json({ message: 'Success', data: { translated } });
    } catch (error) {
      return res.status(400).json({ message: 'Ekspresi tidak valid' });
    }
  }
}

export default new MiscController();